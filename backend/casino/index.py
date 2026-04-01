import json
import hashlib
import secrets
import string
import os
import psycopg
from datetime import datetime

DB_URL = os.environ.get("DATABASE_URL", "")
SCHEMA = "t_p78644969_casino_slot_mine"


def get_conn():
    return psycopg.connect(DB_URL)


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    hashed = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"{salt}:{hashed}"


def verify_password(password: str, stored: str) -> bool:
    parts = stored.split(":")
    if len(parts) != 2:
        return False
    salt, hashed = parts
    return hashlib.sha256((password + salt).encode()).hexdigest() == hashed


def generate_user_id() -> str:
    chars = string.ascii_uppercase + string.digits
    return "KC" + "".join(secrets.choice(chars) for _ in range(6))


def generate_token(user_id: str) -> str:
    return hashlib.sha256((user_id + secrets.token_hex(16)).encode()).hexdigest()


def cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Content-Type": "application/json",
    }


def response(status: int, body: dict):
    return {"statusCode": status, "headers": cors_headers(), "body": json.dumps(body)}


def handler(event, context):
    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")
    body = {}

    if method == "OPTIONS":
        return response(200, {})

    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            pass

    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                # REGISTER
                if path.endswith("/register") and method == "POST":
                    username = body.get("username", "").strip()
                    email = body.get("email", "").strip().lower()
                    password = body.get("password", "")

                    if not username or not email or not password:
                        return response(400, {"error": "Заполните все поля"})
                    if len(password) < 6:
                        return response(400, {"error": "Пароль минимум 6 символов"})

                    cur.execute(
                        f"SELECT id FROM {SCHEMA}.users WHERE username=%s OR email=%s",
                        (username, email),
                    )
                    if cur.fetchone():
                        return response(409, {"error": "Логин или email уже занят"})

                    user_id = generate_user_id()
                    # Ensure unique
                    for _ in range(10):
                        cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE user_id=%s", (user_id,))
                        if not cur.fetchone():
                            break
                        user_id = generate_user_id()

                    pw_hash = hash_password(password)
                    cur.execute(
                        f"INSERT INTO {SCHEMA}.users (user_id, username, email, password_hash, balance) VALUES (%s, %s, %s, %s, 0) RETURNING id",
                        (user_id, username, email, pw_hash),
                    )
                    conn.commit()
                    token = generate_token(user_id)
                    return response(200, {
                        "token": token,
                        "user": {"user_id": user_id, "username": username, "email": email, "balance": 0},
                    })

                # LOGIN
                elif path.endswith("/login") and method == "POST":
                    login = body.get("login", "").strip()
                    password = body.get("password", "")

                    cur.execute(
                        f"SELECT user_id, username, email, password_hash, balance FROM {SCHEMA}.users WHERE username=%s OR email=%s",
                        (login, login),
                    )
                    row = cur.fetchone()
                    if not row:
                        return response(401, {"error": "Пользователь не найден"})

                    user_id, username, email, pw_hash, balance = row
                    if not verify_password(password, pw_hash):
                        return response(401, {"error": "Неверный пароль"})

                    token = generate_token(user_id)
                    return response(200, {
                        "token": token,
                        "user": {"user_id": user_id, "username": username, "email": email, "balance": float(balance)},
                    })

                # GET PROFILE
                elif path.endswith("/profile") and method == "GET":
                    uid = event.get("queryStringParameters", {}) or {}
                    user_id = uid.get("user_id", "")
                    if not user_id:
                        return response(400, {"error": "user_id обязателен"})

                    cur.execute(
                        f"SELECT user_id, username, email, balance, created_at FROM {SCHEMA}.users WHERE user_id=%s",
                        (user_id,),
                    )
                    row = cur.fetchone()
                    if not row:
                        return response(404, {"error": "Пользователь не найден"})

                    uid2, username, email, balance, created_at = row
                    cur.execute(
                        f"SELECT type, amount, description, created_at FROM {SCHEMA}.transactions WHERE from_user_id=%s OR to_user_id=%s ORDER BY created_at DESC LIMIT 20",
                        (user_id, user_id),
                    )
                    txs = [{"type": r[0], "amount": float(r[1]), "description": r[2], "created_at": str(r[3])} for r in cur.fetchall()]
                    return response(200, {
                        "user": {"user_id": uid2, "username": username, "email": email, "balance": float(balance), "created_at": str(created_at)},
                        "transactions": txs,
                    })

                # UPDATE BALANCE (game result)
                elif path.endswith("/balance") and method == "POST":
                    user_id = body.get("user_id", "")
                    amount = float(body.get("amount", 0))
                    tx_type = body.get("type", "game")
                    desc = body.get("description", "")

                    cur.execute(f"SELECT balance FROM {SCHEMA}.users WHERE user_id=%s", (user_id,))
                    row = cur.fetchone()
                    if not row:
                        return response(404, {"error": "Пользователь не найден"})

                    new_balance = float(row[0]) + amount
                    if new_balance < 0:
                        return response(400, {"error": "Недостаточно средств"})

                    cur.execute(
                        f"UPDATE {SCHEMA}.users SET balance=%s WHERE user_id=%s",
                        (new_balance, user_id),
                    )
                    cur.execute(
                        f"INSERT INTO {SCHEMA}.transactions (from_user_id, to_user_id, amount, type, description) VALUES (%s, %s, %s, %s, %s)",
                        (user_id if amount < 0 else None, user_id if amount > 0 else None, abs(amount), tx_type, desc),
                    )
                    conn.commit()
                    return response(200, {"balance": new_balance})

                # TRANSFER
                elif path.endswith("/transfer") and method == "POST":
                    from_id = body.get("from_user_id", "")
                    to_id = body.get("to_user_id", "").upper()
                    amount = float(body.get("amount", 0))

                    if amount <= 0:
                        return response(400, {"error": "Сумма должна быть больше 0"})
                    if from_id == to_id:
                        return response(400, {"error": "Нельзя перевести самому себе"})

                    cur.execute(f"SELECT balance, username FROM {SCHEMA}.users WHERE user_id=%s", (from_id,))
                    from_row = cur.fetchone()
                    if not from_row:
                        return response(404, {"error": "Отправитель не найден"})
                    from_balance, from_name = from_row

                    if float(from_balance) < amount:
                        return response(400, {"error": "Недостаточно средств"})

                    cur.execute(f"SELECT balance, username FROM {SCHEMA}.users WHERE user_id=%s", (to_id,))
                    to_row = cur.fetchone()
                    if not to_row:
                        return response(404, {"error": "Получатель с таким ID не найден"})
                    to_balance, to_name = to_row

                    new_from = float(from_balance) - amount
                    new_to = float(to_balance) + amount

                    cur.execute(f"UPDATE {SCHEMA}.users SET balance=%s WHERE user_id=%s", (new_from, from_id))
                    cur.execute(f"UPDATE {SCHEMA}.users SET balance=%s WHERE user_id=%s", (new_to, to_id))
                    cur.execute(
                        f"INSERT INTO {SCHEMA}.transactions (from_user_id, to_user_id, amount, type, description) VALUES (%s, %s, %s, %s, %s)",
                        (from_id, to_id, amount, "transfer", f"Перевод от {from_name} к {to_name}"),
                    )
                    conn.commit()
                    return response(200, {"balance": new_from, "to_username": to_name})

                # USE PROMO CODE
                elif path.endswith("/promo") and method == "POST":
                    user_id = body.get("user_id", "")
                    code = body.get("code", "").upper().strip()

                    cur.execute(
                        f"SELECT bonus_amount, max_uses, used_count, is_active FROM {SCHEMA}.promo_codes WHERE code=%s",
                        (code,),
                    )
                    promo = cur.fetchone()
                    if not promo:
                        return response(404, {"error": "Промокод не найден"})

                    bonus, max_uses, used_count, is_active = promo
                    if not is_active:
                        return response(400, {"error": "Промокод недействителен"})
                    if used_count >= max_uses:
                        return response(400, {"error": "Промокод исчерпан"})

                    cur.execute(
                        f"SELECT id FROM {SCHEMA}.promo_uses WHERE user_id=%s AND promo_code=%s",
                        (user_id, code),
                    )
                    if cur.fetchone():
                        return response(400, {"error": "Вы уже использовали этот промокод"})

                    cur.execute(f"SELECT balance FROM {SCHEMA}.users WHERE user_id=%s", (user_id,))
                    row = cur.fetchone()
                    if not row:
                        return response(404, {"error": "Пользователь не найден"})

                    new_balance = float(row[0]) + float(bonus)
                    cur.execute(f"UPDATE {SCHEMA}.users SET balance=%s WHERE user_id=%s", (new_balance, user_id))
                    cur.execute(
                        f"INSERT INTO {SCHEMA}.promo_uses (user_id, promo_code) VALUES (%s, %s)",
                        (user_id, code),
                    )
                    cur.execute(
                        f"UPDATE {SCHEMA}.promo_codes SET used_count=used_count+1 WHERE code=%s",
                        (code,),
                    )
                    cur.execute(
                        f"INSERT INTO {SCHEMA}.transactions (to_user_id, amount, type, description) VALUES (%s, %s, %s, %s)",
                        (user_id, float(bonus), "promo", f"Промокод {code}"),
                    )
                    conn.commit()
                    return response(200, {"balance": new_balance, "bonus": float(bonus)})

                # FIND USER BY ID (for transfer lookup)
                elif path.endswith("/user_lookup") and method == "GET":
                    params = event.get("queryStringParameters", {}) or {}
                    target_id = (params.get("user_id", "")).upper()
                    cur.execute(
                        f"SELECT user_id, username FROM {SCHEMA}.users WHERE user_id=%s",
                        (target_id,),
                    )
                    row = cur.fetchone()
                    if not row:
                        return response(404, {"error": "Пользователь не найден"})
                    return response(200, {"user_id": row[0], "username": row[1]})

                else:
                    return response(404, {"error": "Endpoint not found"})

    except Exception as e:
        return response(500, {"error": str(e)})
