FROM node:16

WORKDIR /usr/src

ENV PATH /app/node_modules/.bin:$PATH

COPY package*.json .

RUN cd ..
RUN echo $(pwd)
RUN npm install --silent
RUN npm install react-scripts
RUN cd /usr/src

COPY frontend .

EXPOSE 3000

CMD ["npm", "start"]