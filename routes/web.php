<?php

use App\Http\Controllers\CatalogController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DesignController;
use App\Http\Controllers\PrinterController;
use App\Http\Controllers\PrinterImageController;
use App\Http\Controllers\PrinterSettingController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VerificationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => redirect()->route('dashboard'));

Route::middleware('auth')->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Diseños
    Route::get('/designs',                                    [DesignController::class, 'index'])->name('designs.index');
    Route::get('/designs/create',                             [DesignController::class, 'create'])->name('designs.create');
    Route::post('/designs',                                   [DesignController::class, 'store'])->name('designs.store');
    Route::get('/designs/{design}',                           [DesignController::class, 'show'])->name('designs.show');
    Route::get('/designs/{design}/edit',                      [DesignController::class, 'edit'])->name('designs.edit');
    Route::get('/designs/{design}/traceability/{printer}',    [DesignController::class, 'traceability'])->name('designs.traceability');
    Route::patch('/designs/{design}',                         [DesignController::class, 'update'])->name('designs.update');
    Route::get('/designs/{design}/preview',                   [DesignController::class, 'preview'])->name('designs.preview');
    Route::get('/designs/{design}/download',                  [DesignController::class, 'download'])->name('designs.download');
    Route::delete('/designs/{design}',                        [DesignController::class, 'destroy'])->name('designs.destroy');
    Route::post('/designs/{design}/settings/{printer}',       [PrinterSettingController::class, 'upsert'])->name('designs.settings.upsert');
    Route::post('/designs/{design}/verifications/{printer}',  [VerificationController::class, 'store'])->name('designs.verifications.store');

    // Etiquetas
    Route::get('/tags',                          [TagController::class, 'index'])->name('tags.index');
    Route::post('/designs/{design}/tags',        [TagController::class, 'sync'])->name('designs.tags.sync');

    // Galería de imágenes por impresora
    Route::post('/designs/{design}/images/{printer}',  [PrinterImageController::class, 'store'])->name('designs.images.store');
    Route::get('/printer-images/{image}',              [PrinterImageController::class, 'show'])->name('printer-images.show');
    Route::delete('/printer-images/{image}',           [PrinterImageController::class, 'destroy'])->name('printer-images.destroy');

    // Perfil
    Route::get('/profile',    [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile',  [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Admin
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/catalog',                       [CatalogController::class, 'index'])->name('admin.catalog');
        Route::post('/brands',                       [CatalogController::class, 'storeBrand'])->name('admin.brands.store');
        Route::patch('/brands/{brand}',              [CatalogController::class, 'updateBrand'])->name('admin.brands.update');
        Route::delete('/brands/{brand}',             [CatalogController::class, 'destroyBrand'])->name('admin.brands.destroy');
        Route::post('/brands/{brand}/models',        [CatalogController::class, 'storeModel'])->name('admin.models.store');
        Route::patch('/models/{model}',              [CatalogController::class, 'updateModel'])->name('admin.models.update');
        Route::delete('/models/{model}',             [CatalogController::class, 'destroyModel'])->name('admin.models.destroy');

        Route::get('/printers',              [PrinterController::class, 'index'])->name('admin.printers');
        Route::post('/printers',             [PrinterController::class, 'store'])->name('admin.printers.store');
        Route::patch('/printers/{printer}',  [PrinterController::class, 'update'])->name('admin.printers.update');
        Route::delete('/printers/{printer}', [PrinterController::class, 'destroy'])->name('admin.printers.destroy');

        Route::get('/users',              [UserController::class, 'index'])->name('admin.users');
        Route::post('/users',             [UserController::class, 'store'])->name('admin.users.store');
        Route::patch('/users/{user}',     [UserController::class, 'update'])->name('admin.users.update');
        Route::delete('/users/{user}',    [UserController::class, 'destroy'])->name('admin.users.destroy');
    });
});

require __DIR__.'/auth.php';
