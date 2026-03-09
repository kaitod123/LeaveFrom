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
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

Route::get('/add-pdf-column', function () {
    if (!Schema::hasColumn('leave_requests', 'pdf_base64')) {
        Schema::table('leave_requests', function (Blueprint $table) {
            $table->longText('pdf_base64')->nullable(); // สร้างช่องเก็บไฟล์ขนาดใหญ่
        });
        return "เพิ่มช่องเก็บไฟล์ PDF สำเร็จ!";
    }
    return "มีช่องเก็บไฟล์อยู่แล้วครับ";
});
Route::get('/', function () {
    return view('welcome');
});
