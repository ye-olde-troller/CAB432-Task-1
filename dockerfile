FROM node:20

WORKDIR /usr/src/app

#install packages
COPY ./package*.json ./
RUN npm install

#copy app source files
COPY ./ .

#build the css in case it wasn't built before upload
RUN npm run build:css

CMD ["npm", "start"]