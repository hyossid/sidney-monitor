ARG BASE_IMAGE=node:16.18.1-bullseye-slim
FROM $BASE_IMAGE
WORKDIR /build
COPY package.json /build/package.json
COPY yarn.lock /build/yarn.lock
COPY .yarn/releases /build/releases
RUN yarn install --production && \
    mv node_modules /node_modules && \
    yarn
COPY tsconfig.json /build/tsconfig.json
COPY src /build/src
ARG TARGET_ENV
RUN yarn build && \
    wc -l dist/main.js
