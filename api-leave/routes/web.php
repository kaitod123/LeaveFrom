<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/
use Illuminate\Support\Facades\Artisan;

Route::get('/run-migrate', function () {
    Artisan::call('migrate', ['--force' => true]);
    return "Database migrated successfully!";
});
Route::get('/', function () {
    return view('welcome');
});
Route::get('/init-admin', function () {
    // คำสั่งสร้าง Admin เริ่มต้น (แก้ไขข้อมูลตามต้องการ)
    \App\Models\User::updateOrCreate(
        ['username' => 'admin'],
        [
            'name' => 'Administrator',
            'password' => bcrypt('password123'), // ตั้งรหัสผ่านที่นี่
            'role' => 'admin'
        ]
    );
    return "Admin created!";
});
