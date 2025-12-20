from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Mapped

Base = declarative_base()

class Messages(Base):
    __tablename__ = 'messages'

    id: Mapped[int] = Column(Integer, unique=True, autoincrement=True, primary_key=True)
    message: Mapped[str] = Column(String)
class Users(Base):
    __tablename__ = 'users'

    id: Mapped[int] = Column(Integer, unique=True, autoincrement=True, primary_key=True)
    username: Mapped[str] = Column(String, unique=True)
    password: Mapped[str] = Column(String)