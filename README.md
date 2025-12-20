# MySimpleMessenger 
Для запуска нужно:  
из директории \client в терминал ввести команды  
  
```
npm i vite  
npm run dev
```  
из директории \server в терминал ввести команды  
```
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install uvicorn fastapi sqlalchemy aiosqlite websockets passlib[bcrypt] argon2_cffi alembic
alembic stamp head
alembic revision --autogenerate
alembic upgrade head
uvicorn main:app --reload
```
Приложение по умолчанию запускается по адресу "http://localhost:5173/"  

