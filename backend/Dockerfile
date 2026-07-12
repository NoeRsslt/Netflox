FROM node:20-alpine

# ffmpeg est nécessaire pour ffprobe/ffmpeg (détection et extraction des sous-titres intégrés)
RUN apk add --no-cache ffmpeg

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY src ./src

EXPOSE 4000

CMD ["node", "src/index.js"]
