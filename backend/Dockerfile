FROM python:3.11.4

WORKDIR /smartqueue-backend/app/

RUN ls -lha
COPY ./requirements.txt requirements.txt
RUN python -m pip install --upgrade pip
RUN python -m pip install -r requirements.txt
RUN ls -lha

WORKDIR /smartqueue-backend/
COPY . .

ENV PYTHONPATH=/smartqueue-backend
CMD alembic upgrade head && python main.py
