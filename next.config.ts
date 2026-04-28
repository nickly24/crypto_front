import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  /**
   * После каждого деплоя у пользователей в кэше может остаться старый index.html со ссылками
   * на удалённые чанки — браузер получает 404 по JS и часто уходит в цикл полных перезагрузок.
   * На nginx/Timeweb для HTML задайте Cache-Control: no-cache (или max-age=0, must-revalidate),
   * а для /_next/static/* — long-cache (имена файлов с хэшем).
   * Пример nginx: location / { try_files $uri $uri.html $uri/index.html /index.html; }
   */
};

export default nextConfig;
