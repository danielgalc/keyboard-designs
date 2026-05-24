<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class SetupPasswordController extends Controller
{
    public function show(string $token)
    {
        $record = DB::table('password_setup_tokens')
            ->where('token', hash('sha256', $token))
            ->first();

        if (! $record || now()->diffInHours($record->created_at) > 24) {
            return Inertia::render('Auth/SetupPassword', ['expired' => true, 'token' => null, 'email' => null]);
        }

        return Inertia::render('Auth/SetupPassword', [
            'expired' => false,
            'token'   => $token,
            'email'   => $record->email,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'token'                 => 'required|string',
            'password'              => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required|string',
        ]);

        $record = DB::table('password_setup_tokens')
            ->where('token', hash('sha256', $request->token))
            ->first();

        if (! $record || now()->diffInHours($record->created_at) > 24) {
            return back()->withErrors(['token' => 'El enlace ha caducado. Contacta con el administrador.']);
        }

        $user = User::where('email', $record->email)->firstOrFail();
        $user->password = Hash::make($request->password);
        $user->save();

        DB::table('password_setup_tokens')->where('email', $record->email)->delete();

        return redirect()->route('login')->with('status', '¡Contraseña establecida! Ya puedes iniciar sesión.');
    }
}
