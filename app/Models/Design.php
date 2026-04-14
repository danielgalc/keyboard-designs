<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Design extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'laptop_brand',
        'laptop_model',
        'source_language',
        'target_language',
        'description',
        'file_path',
        'file_name',
        'file_mime_type',
        'file_size',
        'created_by',
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function printerSettings(): HasMany
    {
        return $this->hasMany(PrinterSetting::class);
    }

    public function verifications(): HasMany
    {
        return $this->hasMany(Verification::class)->latest('verified_at');
    }

    public function latestVerificationFor(int $printerId): ?Verification
    {
        return $this->verifications()
            ->where('printer_id', $printerId)
            ->first();
    }
}
