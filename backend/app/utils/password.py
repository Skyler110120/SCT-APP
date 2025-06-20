from passlib.context import CryptContext

# Ceate password context with bcrypt hashing algorithm
password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt
    Args:
        password: plain text password to hash
    Returns:
        the hashed password
    """
    return password_context.hash(password)

def verify_password(password: str, hashed_password: str) -> bool:
    """
    Verifies a password against a hashed password
    Args:
        password: plain text password to verify
        hashed_password: the hashed password to compare against
    Returns:
        True if the password is valid, False otherwise
    """
    return password_context.verify(password, hashed_password)