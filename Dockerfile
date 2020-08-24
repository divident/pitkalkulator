FROM node:15.4.0-alpine3.10
RUN apk --update add python3 py3-pip postgresql-dev gcc python3-dev musl-dev nodejs nginx vim
RUN npm install --global pm2

WORKDIR /app/client

COPY requirements.txt /app/requirements.txt
RUN pip3 install -r /app/requirements.txt

COPY ./client/package*.json ./
RUN npm install

COPY ./client ./
RUN rm -rf .next
RUN npm run build

WORKDIR /app



COPY . /app

RUN mkdir -p /run/nginx

COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./default.conf /etc/nginx/conf.d/default.conf 

RUN mkdir -p /var/www/static
COPY ./static/img /var/www/static/img 

CMD /app/process-wrapper.sh
