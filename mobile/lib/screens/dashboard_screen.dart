import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../services/api_service.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final ApiService _api = ApiService();
  Map<String, dynamic>? _stats;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  void _loadStats() async {
    try {
      final stats = await _api.getDashboardStats();
      setState(() {
        _stats = stats;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthService>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('LearnEd Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => auth.logout(),
          )
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () async {
                _loadStats();
              },
              child: ListView(
                padding: const EdgeInsets.all(16.0),
                children: [
                  _buildStatCard('Mastery', '${_stats?['mastery'] ?? 0}%', Icons.trending_up, Colors.blue),
                  const SizedBox(height: 16),
                  _buildStatCard('Total Attempts', '${_stats?['totalAttempts'] ?? 0}', Icons.history, Colors.orange),
                  const SizedBox(height: 24),
                  const Text('Recent Activity', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  ...?_stats?['recentActivity']?.map<Widget>((item) => Card(
                        child: ListTile(
                          leading: Icon(
                            item['is_correct'] ? Icons.check_circle : Icons.cancel,
                            color: item['is_correct'] ? Colors.green : Colors.red,
                          ),
                          title: Text(item['stem'], maxLines: 1, overflow: TextOverflow.ellipsis),
                          subtitle: Text(item['created_at'].substring(0, 10)),
                        ),
                      )),
                ],
              ),
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.pushNamed(context, '/question');
        },
        label: const Text('Start Practice'),
        icon: const Icon(Icons.play_arrow),
      ),
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          children: [
            CircleAvatar(backgroundColor: color.withOpacity(0.1), child: Icon(icon, color: color)),
            const SizedBox(width: 16),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(color: Colors.grey)),
                Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
              ],
            )
          ],
        ),
      ),
    );
  }
}
