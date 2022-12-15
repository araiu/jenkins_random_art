FROM denoland/deno:alpine
# Using template from railwayapp-templates/deno/blob/main/Dockerfile, with changed base image
WORKDIR /app

USER deno

# These steps will be re-run upon each file change in your working directory:
ADD . .

CMD deno run --allow-net --allow-env src/index.ts
