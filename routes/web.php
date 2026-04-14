<?php

use App\Http\Controllers\DesignController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('designs.index');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    // Diseños
    Route::get('/designs', [DesignController::class, 'index'])->name('designs.index');
    Route::get('/designs/create', [DesignController::class, 'create'])->name('designs.create');
    Route::post('/designs', [DesignController::class, 'store'])->name('designs.store');
    Route::get('/designs/{design}', [DesignController::class, 'show'])->name('designs.show');
    Route::get('/designs/{design}/download', [DesignController::class, 'download'])->name('designs.download');
    Route::delete('/designs/{design}', [DesignController::class, 'destroy'])->name('designs.destroy');

    // Perfil
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
