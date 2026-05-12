$ErrorActionPreference = 'Continue'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Add-Type @"
using System;
using System.Runtime.InteropServices;

public class MarathonKeySender {
    [StructLayout(LayoutKind.Sequential)]
    public struct INPUT {
        public uint type;
        public InputUnion U;
        public static int Size { get { return Marshal.SizeOf(typeof(INPUT)); } }
    }
    [StructLayout(LayoutKind.Explicit)]
    public struct InputUnion {
        [FieldOffset(0)] public MOUSEINPUT mi;
        [FieldOffset(0)] public KEYBDINPUT ki;
        [FieldOffset(0)] public HARDWAREINPUT hi;
    }
    [StructLayout(LayoutKind.Sequential)]
    public struct MOUSEINPUT {
        public int dx; public int dy; public uint mouseData;
        public uint dwFlags; public uint time; public IntPtr dwExtraInfo;
    }
    [StructLayout(LayoutKind.Sequential)]
    public struct KEYBDINPUT {
        public ushort wVk; public ushort wScan; public uint dwFlags;
        public uint time; public IntPtr dwExtraInfo;
    }
    [StructLayout(LayoutKind.Sequential)]
    public struct HARDWAREINPUT {
        public uint uMsg; public ushort wParamL; public ushort wParamH;
    }
    [DllImport("user32.dll", SetLastError=true)]
    public static extern uint SendInput(uint nInputs, INPUT[] pInputs, int cbSize);

    public const uint INPUT_KEYBOARD = 1;
    public const uint KEYEVENTF_KEYUP = 0x0002;

    public static void Send(ushort vk, bool down) {
        INPUT[] inputs = new INPUT[1];
        inputs[0].type = INPUT_KEYBOARD;
        inputs[0].U.ki.wVk = vk;
        inputs[0].U.ki.dwFlags = down ? 0 : KEYEVENTF_KEYUP;
        SendInput(1, inputs, INPUT.Size);
    }
}
"@

$vk = @{
    'a'=0x41;'b'=0x42;'c'=0x43;'d'=0x44;'e'=0x45;'f'=0x46;'g'=0x47;'h'=0x48
    'i'=0x49;'j'=0x4A;'k'=0x4B;'l'=0x4C;'m'=0x4D;'n'=0x4E;'o'=0x4F;'p'=0x50
    'q'=0x51;'r'=0x52;'s'=0x53;'t'=0x54;'u'=0x55;'v'=0x56;'w'=0x57;'x'=0x58
    'y'=0x59;'z'=0x5A
    '0'=0x30;'1'=0x31;'2'=0x32;'3'=0x33;'4'=0x34
    '5'=0x35;'6'=0x36;'7'=0x37;'8'=0x38;'9'=0x39
    'f1'=0x70;'f2'=0x71;'f3'=0x72;'f4'=0x73;'f5'=0x74;'f6'=0x75
    'f7'=0x76;'f8'=0x77;'f9'=0x78;'f10'=0x79;'f11'=0x7A;'f12'=0x7B
    'f13'=0x7C;'f14'=0x7D;'f15'=0x7E;'f16'=0x7F;'f17'=0x80;'f18'=0x81
    'f19'=0x82;'f20'=0x83;'f21'=0x84;'f22'=0x85;'f23'=0x86;'f24'=0x87
    'space'=0x20;'enter'=0x0D;'return'=0x0D;'tab'=0x09;'escape'=0x1B;'esc'=0x1B
    'backspace'=0x08
    'shift'=0xA0;'lshift'=0xA0;'rshift'=0xA1
    'ctrl'=0xA2;'control'=0xA2;'lctrl'=0xA2;'rctrl'=0xA3
    'alt'=0xA4;'lalt'=0xA4;'ralt'=0xA5
    'win'=0x5B;'lwin'=0x5B;'rwin'=0x5C
    'up'=0x26;'down'=0x28;'left'=0x25;'right'=0x27
    'minus'=0xBD;'equals'=0xBB;'plus'=0xBB;'backtick'=0xC0;'grave'=0xC0
    'lbracket'=0xDB;'rbracket'=0xDD
    'semicolon'=0xBA;'quote'=0xDE;'apostrophe'=0xDE
    'comma'=0xBC;'period'=0xBE;'slash'=0xBF;'backslash'=0xDC
    'capslock'=0x14;'numlock'=0x90;'scrolllock'=0x91
    'pageup'=0x21;'pagedown'=0x22;'home'=0x24;'end'=0x23
    'insert'=0x2D;'delete'=0x2E;'del'=0x2E
    'numpad0'=0x60;'numpad1'=0x61;'numpad2'=0x62;'numpad3'=0x63;'numpad4'=0x64
    'numpad5'=0x65;'numpad6'=0x66;'numpad7'=0x67;'numpad8'=0x68;'numpad9'=0x69
    'multiply'=0x6A;'add'=0x6B;'subtract'=0x6D;'decimal'=0x6E;'divide'=0x6F
}

function Resolve-Combo($combo) {
    if ([string]::IsNullOrWhiteSpace($combo)) { return $null }
    $parts = $combo -split '\+' | ForEach-Object { $_.Trim().ToLower() }
    $codes = @()
    foreach ($p in $parts) {
        if (-not $vk.ContainsKey($p)) { return $null }
        $codes += [ushort]$vk[$p]
    }
    return ,$codes
}

while ($true) {
    $line = [Console]::In.ReadLine()
    if ($null -eq $line) { break }
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    try {
        $cmd = $line | ConvertFrom-Json
        $codes = Resolve-Combo $cmd.key
        if ($null -eq $codes -or $codes.Count -eq 0) { continue }
        switch ($cmd.op) {
            'down' {
                foreach ($c in $codes) { [MarathonKeySender]::Send($c, $true) }
            }
            'up' {
                $rev = @($codes); [array]::Reverse($rev)
                foreach ($c in $rev) { [MarathonKeySender]::Send($c, $false) }
            }
            'tap' {
                foreach ($c in $codes) { [MarathonKeySender]::Send($c, $true) }
                Start-Sleep -Milliseconds 25
                $rev = @($codes); [array]::Reverse($rev)
                foreach ($c in $rev) { [MarathonKeySender]::Send($c, $false) }
            }
        }
    } catch {
        [Console]::Error.WriteLine("sender error: $_")
    }
}
