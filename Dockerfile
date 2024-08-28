# Stage 1: Build the React app
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build  # Creates the build folder with the compiled static files

# Stage 2: Serve the built app with Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
# Copy build files to Nginx directory

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

