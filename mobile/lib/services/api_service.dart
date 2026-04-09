import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  final _storage = const FlutterSecureStorage();
  final String _baseUrl = 'http://10.0.2.2:3000/api';

  Future<Map<String, String>> _getHeaders() async {
    final token = await _storage.read(key: 'jwt_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  // Learn Module
  Future<List<dynamic>> getQuestions() async {
    final response = await http.get(
      Uri.parse('$_baseUrl/learn/questions'),
      headers: await _getHeaders(),
    );
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to load questions');
  }

  Future<Map<String, dynamic>> submitAttempt(String questionId, String optionId, bool isCorrect) async {
    final userId = await _storage.read(key: 'user_id');
    final response = await http.post(
      Uri.parse('$_baseUrl/learn/attempt'),
      headers: await _getHeaders(),
      body: json.encode({
        'user_id': userId,
        'question_id': questionId,
        'selected_option_id': optionId,
        'is_correct': isCorrect,
      }),
    );
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to submit attempt');
  }

  // Insights Module
  Future<Map<String, dynamic>> getDashboardStats() async {
    final userId = await _storage.read(key: 'user_id');
    final response = await http.get(
      Uri.parse('$_baseUrl/insights/dashboard/$userId'),
      headers: await _getHeaders(),
    );
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to load stats');
  }
}
