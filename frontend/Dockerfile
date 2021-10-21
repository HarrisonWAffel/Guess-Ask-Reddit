FROM node:16

WORKDIR /usr/src

ENV PATH /app/node_modules/.bin:$PATH

COPY package*.json .

RUN cd ..
RUN echo $(pwwd)
RUN npm install --silent
RUN npm install react-scripts
RUN cd /usr/src

COPY . .

EXPOSE 3000

CMD ["npm", "start"]