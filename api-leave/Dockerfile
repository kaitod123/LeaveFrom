# ใช้ภาพพื้นฐานที่มี PHP และ Apache
FROM php:8.1-apache

# ติดตั้งส่วนขยายที่ Laravel ต้องการ
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    git \
    curl \
    libzip-dev

RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# เปิดการใช้งาน Apache rewrite module
RUN a2enmod rewrite

# ตั้งค่า Working Directory
WORKDIR /var/www/html

# คัดลอกไฟล์โปรเจกต์เข้าไป
COPY . .

# ติดตั้ง Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN composer install --no-dev --optimize-autoloader

# ตั้งค่า Permission สำหรับโฟลเดอร์ Storage
RUN chown -R www-data:www-data storage bootstrap/cache

# ตั้งค่า Document Root ของ Apache ไปที่โฟลเดอร์ public
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

RUN docker-php-ext-install pdo_mysql pdo_pgsql pgsql mbstring exif pcntl bcmath gd zip

# กำหนด Port
EXPOSE 80
CMD sed -i "s/80/$PORT/g" /etc/apache2/sites-available/000-default.conf /etc/apache2/ports.conf && php artisan storage:link && php artisan migrate --force && apache2-foreground
