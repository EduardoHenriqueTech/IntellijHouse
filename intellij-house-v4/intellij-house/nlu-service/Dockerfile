FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
# Treina o modelo de intenções durante o build (a imagem já sobe pronta)
RUN python treinar_modelo.py
ENV PORT=5001
EXPOSE 5001
CMD ["sh", "-c", "gunicorn -w 1 -b 0.0.0.0:${PORT} app:app"]
