FROM node:18 as compilestage
COPY . .
RUN npm install
RUN npm run compile
WORKDIR /build
RUN rm -r mockData
RUN rm -r tests
RUN rm -r models

FROM node:18
RUN mkdir todo-app-api
WORKDIR /todo-app-api
COPY ./package*.json .
COPY --from=compilestage ./build .

# Holds environment files, such as cookie certs
RUN mkdir envFiles

RUN npm install --omit=dev

USER node

EXPOSE 4000
ENTRYPOINT ["npm", "run"]
CMD ["prod:local"]