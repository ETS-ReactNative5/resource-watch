FROM node:14.17-alpine
LABEL maintainer="hello@vizzuality.com"

ARG NEXT_PUBLIC_AUTH_CALLBACK=https://resourcewatch.org/auth-callback
ARG NEXTAUTH_URL=https://resourcewatch.org
ARG NEXTAUTH_JWT_SECRET=thisIsAVeryBadSecret
ARG NEXT_PUBLIC_RW_GOGGLE_API_TOKEN_SHORTENER=not_valid
ARG NEXT_PUBLIC_RW_MAPBOX_API_TOKEN=not_valid
ARG NEXT_PUBLIC_GLOBAL_FISHING_WATCH_TOKEN=not_valid
ARG NEXT_PUBLIC_WRI_API_URL=https://api.resourcewatch.org
ARG NEXT_PUBLIC_FEATURE_FLAG_GEDC_DASHBOARD=false
ARG NEXT_PUBLIC_API_ENV=production
ARG NEXT_PUBLIC_ENVS_SHOW=production
ARG NEXT_PUBLIC_ENVS_EDIT=production

ENV NEXT_PUBLIC_ADD_SEARCH_KEY ea4c79622844ade140170b141c36f14f
ENV NEXT_PUBLIC_API_ENV $NEXT_PUBLIC_API_ENV
ENV NEXT_PUBLIC_APPLICATIONS rw
ENV NEXT_PUBLIC_BING_MAPS_API_KEY PPB0chXATYqlJ5t8oMPp~8SV9SIe2D0Ntc5sW3HExZA~AqTJgLkvvOdot-y1QukRox537t604Je0pxhygfcraTQGVWr7Ko9LwPoS7-MHW0qY
ENV NEXT_PUBLIC_BITLY_TOKEN e3076fc3bfeee976efb9966f49383e1a8fb71c5f
ENV NEXT_PUBLIC_BLOG_API_URL https://blog.resourcewatch.org/wp-json/wp/v2
ENV NEXT_PUBLIC_AUTH_CALLBACK $NEXT_PUBLIC_AUTH_CALLBACK
ENV NEXTAUTH_URL $NEXTAUTH_URL
ENV NEXTAUTH_JWT_SECRET $NEXTAUTH_JWT_SECRET
ENV NEXT_PUBLIC_GOOGLE_ANALYTICS UA-67196006-1
ENV NODE_ENV production
ENV NEXT_PUBLIC_RW_GOGGLE_API_TOKEN_SHORTENER $NEXT_PUBLIC_RW_GOGGLE_API_TOKEN_SHORTENER
ENV NEXT_PUBLIC_RW_MAPBOX_API_TOKEN $NEXT_PUBLIC_RW_MAPBOX_API_TOKEN
ENV NEXT_PUBLIC_GLOBAL_FISHING_WATCH_TOKEN $NEXT_PUBLIC_GLOBAL_FISHING_WATCH_TOKEN
ENV NEXT_PUBLIC_WRI_API_URL $NEXT_PUBLIC_WRI_API_URL
ENV NEXT_PUBLIC_FEATURE_FLAG_GEDC_DASHBOARD $NEXT_PUBLIC_FEATURE_FLAG_GEDC_DASHBOARD
ENV NEXT_PUBLIC_ENVS_SHOW $NEXT_PUBLIC_ENVS_SHOW
ENV NEXT_PUBLIC_ENVS_EDIT $NEXT_PUBLIC_ENVS_EDIT


# Install dependencies only when needed
FROM node:14.17-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock ./
RUN apk update && apk add --no-cache git
RUN yarn install --frozen-lockfile

# Rebuild the source code only when needed
FROM node:14.17-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

# Production image, copy all the files and run next
FROM node:14.17-alpine AS runner
WORKDIR /app

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.browserlistrc ./
COPY --from=builder /app/.env.test ./
COPY --from=builder /app/.env.production ./
COPY --from=builder /app/index.js ./
COPY --from=builder /app/next-env.d.ts ./
COPY --from=builder /app/next-sitemap.js ./
COPY --from=builder /app/postcss.config.js ./
COPY --from=builder /app/tailwind.config.js ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/entrypoint.sh ./

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# RUN apk update && apk add --no-cache \
#     build-base gcc bash git \
#     cairo-dev pango-dev jpeg-dev

# # Add app directory
# WORKDIR /usr/src/app

# # Copy app folders
# COPY src ./src

# Copy single files
# COPY .babelrc .
# COPY .browserlistrc .
# COPY .env.test .
# COPY .env.production .
# COPY yarn.lock .
# COPY index.js .
# COPY next-env.d.ts .
# COPY next-sitemap.js .
# COPY next.config.js .
# COPY package.json .
# COPY postcss.config.js .
# COPY tailwind.config.js .
# COPY tsconfig.json .

# RUN yarn install --frozen-lockfile --production=false

# RUN yarn build

# COPY entrypoint.sh .

EXPOSE 3000

ENTRYPOINT ["sh", "./entrypoint.sh"]
