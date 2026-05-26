<?php

namespace App\Http\Controllers;

use App\Mail\WelcomeSetPassword;
use App\Mail\WelcomeWithPassword;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = User::withCount('designs')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'role', 'created_at']);

        return Inertia::render('Admin/Users', [
            'users'      => $users,
            'adminCount' => $users->where('role', 'admin')->count(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'nullable|string|min:8|confirmed',
            'role'     => 'required|in:admin,operator',
        ]);

        $hasPassword = ! empty($validated['password']);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($hasPassword ? $validated['password'] : Str::random(40)),
            'role'     => $validated['role'],
        ]);

        if ($hasPassword) {
            Mail::to($user->email)->send(new WelcomeWithPassword($user, $validated['password']));
        } else {
            $plainToken = Str::random(64);
            DB::table('password_setup_tokens')->updateOrInsert(
                ['email' => $user->email],
                ['token' => hash('sha256', $plainToken), 'created_at' => now()],
            );
            $setupUrl = route('password.setup', $plainToken);
            Mail::to($user->email)->send(new WelcomeSetPassword($user, $setupUrl));
        }

        return back()->with('success', 'Usuario creado. Se ha enviado un email de bienvenida.');
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => ['required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => 'nullable|string|min:8|confirmed',
            'role'     => 'required|in:admin,operator',
        ]);

        // No se puede quitar el rol admin si es el único administrador
        if ($user->role === 'admin' && $validated['role'] === 'operator') {
            if (User::where('role', 'admin')->count() <= 1) {
                return back()->with('error', 'No puedes quitar el rol de administrador al único admin del sistema.');
            }
        }

        $user->name  = $validated['name'];
        $user->email = $validated['email'];
        $user->role  = $validated['role'];

        if (! empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return back()->with('success', 'Usuario actualizado.');
    }

    public function destroy(Request $request, User $user)
    {
        // No puede eliminarse a sí mismo
        if ($user->id === $request->user()->id) {
            return back()->with('error', 'No puedes eliminarte a ti mismo.');
        }

        // No puede eliminarse el único administrador
        if ($user->role === 'admin' && User::where('role', 'admin')->count() <= 1) {
            return back()->with('error', 'No puedes eliminar al único administrador del sistema.');
        }

        $name = $user->name;
        $user->delete();

        return back()->with('success', "Usuario \"{$name}\" eliminado.");
    }
}
