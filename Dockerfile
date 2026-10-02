FROM node:24-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY public ./public
COPY fonts ./fonts
RUN apt-get update && apt-get install -y --no-install-recommends fonts-dejavu-core && cp /usr/share/fonts/truetype/dejavu/DejaVuSans.ttf /usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf /usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf ./fonts/ && rm -rf /var/lib/apt/lists/*
COPY server.mjs pricing.mjs color-utils.mjs subscription-policy.mjs withdrawal.mjs ./
COPY ops ./ops
ENV NODE_ENV=production DATA_DIR=/data
EXPOSE 3000
CMD ["node", "server.mjs"]
