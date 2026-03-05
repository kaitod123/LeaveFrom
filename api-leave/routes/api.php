<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\LeaveController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PasswordResetController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// --- Public Routes (ไม่ต้อง Login) ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// +++ เส้นทางสาธารณะสำหรับดูประวัติการลา +++
Route::get('/public/leaves', [LeaveController::class, 'publicIndex']);

Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink']);
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);

// --- Protected Routes (ต้อง Login) ---
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    // Leave API
    Route::get('/leave-request', [LeaveController::class, 'index']);
    Route::post('/leave-request', [LeaveController::class, 'store']);
    Route::put('/leave-request/{id}/status', [LeaveController::class, 'updateStatus']);
    Route::delete('/leave-request/{id}', [LeaveController::class, 'destroy']);
    Route::get('/leave-request/{id}/word', [LeaveController::class, 'downloadWord']);
    Route::post('/leave-request/{id}/upload-pdf', [LeaveController::class, 'uploadPdf']);
    
    // Helper API
    Route::get('/leader-info', [LeaveController::class, 'getLeaderInfo']);
    
    // User Management
    Route::get('/users', [UserController::class, 'index']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

        Route::get('/commanders', [LeaveController::class, 'getCommanders']);
    Route::post('/commanders', [LeaveController::class, 'storeCommander']);
    Route::put('/commanders/{id}', [LeaveController::class, 'updateCommander']);
    Route::delete('/commanders/{id}', [LeaveController::class, 'destroyCommander']);

});