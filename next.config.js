/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // no redirects
  // Note: 'api' config is only for Pages Router, not App Router
  // For App Router, body size limits are handled in route handlers
}

module.exports = nextConfig
