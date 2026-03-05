<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To enable full access for development, use the settings below.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', '*'], // อนุญาตทุก Path

    'allowed_methods' => ['*'], // อนุญาตทุก Method (GET, POST, etc.)

'allowed_origins' => ['https://your-react-app.onrender.com'],

    'allowed_origins_patterns' => [],
    'allowed_origins' => ['https://po-leave-frontend.onrender.com'],

    'allowed_headers' => ['*'], // อนุญาตทุก Header

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];