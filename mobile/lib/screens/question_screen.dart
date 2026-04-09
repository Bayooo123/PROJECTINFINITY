import 'package:flutter/material.dart';
import '../services/api_service.dart';

class QuestionScreen extends StatefulWidget {
  const QuestionScreen({super.key});

  @override
  State<QuestionScreen> createState() => _QuestionScreenState();
}

class _QuestionScreenState extends State<QuestionScreen> {
  final ApiService _api = ApiService();
  List<dynamic> _questions = [];
  int _currentIndex = 0;
  bool _loading = true;
  bool _attempted = false;
  String? _feedback;
  String? _explanation;

  @override
  void initState() {
    super.initState();
    _loadQuestions();
  }

  void _loadQuestions() async {
    try {
      final questions = await _api.getQuestions();
      setState(() {
        _questions = questions;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  void _submitAnswer(bool isCorrect) async {
    if (_attempted) return;
    
    // In a real app, option verification happens here or on backend.
    // For MVP, we simulate "correctness" passed from the button for simplicity,
    // or assume we have options data.
    // We'll treat the button press as the attempt.
    
    try {
      final currentQ = _questions[_currentIndex];
      final result = await _api.submitAttempt(currentQ['id'], 'option_placeholder', isCorrect);
      
      setState(() {
        _attempted = true;
        _feedback = result['feedback'];
        _explanation = result['explanation'];
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Error submitting')));
    }
  }

  void _nextQuestion() {
    if (_currentIndex < _questions.length - 1) {
      setState(() {
        _currentIndex++;
        _attempted = false;
        _feedback = null;
        _explanation = null;
      });
    } else {
      Navigator.pop(context); // Finish
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    if (_questions.isEmpty) return const Scaffold(body: Center(child: Text('No questions available')));

    final q = _questions[_currentIndex];

    return Scaffold(
      appBar: AppBar(title: Text('Question ${_currentIndex + 1}/${_questions.length}')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(q['stem'], style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w500)),
            const SizedBox(height: 24),
            // Mock Options
            if (!_attempted) ...[
              ElevatedButton(onPressed: () => _submitAnswer(true), child: const Text('Correct Option (Simulated)')),
              ElevatedButton(onPressed: () => _submitAnswer(false), child: const Text('Wrong Option (Simulated)')),
            ] else ...[
              Container(
                padding: const EdgeInsets.all(16),
                color: _feedback == 'Correct' ? Colors.green[100] : Colors.red[100],
                child: Column(
                  children: [
                    Text(_feedback ?? '', style: const TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    const Text('Explanation:', style: TextStyle(fontWeight: FontWeight.bold)),
                    Text(_explanation ?? 'No explanation loaded.'),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton(onPressed: _nextQuestion, child: const Text('Next Question')),
            ]
          ],
        ),
      ),
    );
  }
}
