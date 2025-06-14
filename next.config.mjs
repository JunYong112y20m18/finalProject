/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        reactCompiler: true,
    },
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                hostname: "lh3.googleusercontent.com",
            },
            {
                hostname: "avatars.githubusercontent.com",
            },
            {
                hostname: "binayqayzzruvyhalnyx.supabase.co",
            }
        ],
    },
};

export default nextConfig;
