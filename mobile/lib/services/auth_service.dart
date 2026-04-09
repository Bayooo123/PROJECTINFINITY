import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthService with ChangeNotifier {
  final _storage = const FlutterSecureStorage();
  // Android Emulator -> Localhost loopback
  final String _baseUrl = 'http://10.0.2.2:3000/api/auth';
  
  bool _isAuthenticated = false;
  String? _token;
  String? _userId;

  bool get isAuthenticated => _isAuthenticated;
  String? get token => _token;
  String? get userId => _userId;

  Future<void> tryAutoLogin() async {
    final token = await _storage.read(key: 'jwt_token');
    final userId = await _storage.read(key: 'user_id');
    if (token != null) {
      _token = token;
      _userId = userId;
      _isAuthenticated = true;
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/login'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'email': email, 'password': password}),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        _token = data['token'];
        _userId = data['user']['id'];
        _isAuthenticated = true;
        
        await _storage.write(key: 'jwt_token', value: _token);
        await _storage.write(key: 'user_id', value: _userId);
        
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      print(e);
      return false;
    }
  }

  Future<void> logout() async {
    _token = null;
    _userId = null;
    _isAuthenticated = false;
    await _storage.deleteAll();
    notifyListeners();
  }
}
