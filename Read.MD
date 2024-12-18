#backend
python -m venv env
env\Scripts\activate.bat

pip install -r requirements.txt


python manage.py makemigrations
python manage.py migrate
python manage.py runserver

#frontend
npm install
npm i axios react-router-dom jwt-decode date-fns --save react-fontawesome
npm install react-pdf-viewer
