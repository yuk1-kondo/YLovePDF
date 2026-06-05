import 'package:flutter/material.dart';

import '../constants/local_storage.dart';
import '../providers/sticker_store.dart';
import '../widgets/pastel_background.dart';
import 'create_sticker_screen.dart';
import 'sticker_book_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final store = StickerStoreProvider.of(context);

    return AnimatedBuilder(
      animation: store,
      builder: (context, _) {
        return Scaffold(
          body: PastelBackground(
            child: SafeArea(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(24, 48, 24, 24),
                children: [
                  const Icon(
                    Icons.auto_awesome,
                    size: 60,
                    color: Color(0xFFFF8DB7),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Sticker Pocket',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Color(0xFF594157),
                      fontSize: 40,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    '所持シール ${store.count} 枚',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: Color(0xFF9B7E98),
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 28),
                  const _LocalOnlyCard(),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: () => Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => const CreateStickerScreen(),
                      ),
                    ),
                    icon: const Icon(Icons.add_photo_alternate_outlined),
                    label: const Text('シールを作る'),
                  ),
                  const SizedBox(height: 14),
                  OutlinedButton.icon(
                    onPressed: () => Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => const StickerBookScreen(),
                      ),
                    ),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFFFF6FA8),
                      side: const BorderSide(
                        color: Color(0xFFFFB3CE),
                        width: 2,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(22),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      backgroundColor: Colors.white.withOpacity(0.72),
                    ),
                    icon: const Icon(Icons.collections_bookmark_outlined),
                    label: const Text('シール帳を見る'),
                  ),
                  const SizedBox(height: 40),
                  const Text(
                    '写真を選んで、かわいい白フチシールとして保存しよう。',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Color(0xFF9B7E98)),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _LocalOnlyCard extends StatelessWidget {
  const _LocalOnlyCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.76),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFFFD7E6)),
      ),
      child: const Row(
        children: [
          Icon(Icons.lock_outline, color: Color(0xFFFF8DB7)),
          SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  LocalStorageCopy.localOnlyTitle,
                  style: TextStyle(
                    color: Color(0xFF594157),
                    fontWeight: FontWeight.w900,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  LocalStorageCopy.localOnlyDescription,
                  style: TextStyle(color: Color(0xFF9B7E98), fontSize: 12),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
