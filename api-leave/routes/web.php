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
Route::get('/force-migrate-fresh', function () {
    // คำสั่งนี้จะลบทุกตารางและสร้างใหม่ตามไฟล์ Migration ล่าสุดของคุณ
    Artisan::call('migrate:fresh', ['--force' => true]);

    // หลังจากลบตารางแล้ว ต้องสร้าง User Admin กลับมาใหม่ทันที
    \App\Models\User::create([
        'name' => 'Administrator',
        'username' => 'admin',
        'password' => bcrypt('password123'),
        'role' => 'admin'
    ]);

    return "Database Reset and Migrated Successfully! Please login with admin / password123";
});