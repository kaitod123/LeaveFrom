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

Route::get('/force-migrate-fresh', function () {
    Artisan::call('migrate:fresh', ['--force' => true]);
    
    \App\Models\User::updateOrCreate(
        ['username' => 'admin'],
        [
            'name' => 'Administrator',
            'password' => bcrypt('password123'),
            'role' => 'admin'
        ]
    );
    return "Database Reset and Migrated Successfully!";
});
Route::get('/', function () {
    return view('welcome');
});