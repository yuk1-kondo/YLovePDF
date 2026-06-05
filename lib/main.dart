import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';

import 'models/sticker.dart';
import 'providers/sticker_store.dart';
import 'repositories/sticker_repository.dart';
import 'screens/home_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Hive.initFlutter();
  Hive.registerAdapter(StickerAdapter());
  final repository = await StickerRepository.create();
  runApp(StickerPocketApp(repository: repository));
}

class StickerPocketApp extends StatelessWidget {
  const StickerPocketApp({super.key, required this.repository});

  final StickerRepository repository;

  @override
  Widget build(BuildContext context) {
    return StickerStoreProvider(
      store: StickerStore(repository)..loadStickers(),
      child: MaterialApp(
        title: 'Sticker Pocket',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFFFF8DB7),
            primary: const Color(0xFFFF8DB7),
            secondary: const Color(0xFFFFC857),
            surface: const Color(0xFFFFFBFE),
          ),
          scaffoldBackgroundColor: const Color(0xFFFFF7FB),
          fontFamily: 'sans',
          appBarTheme: const AppBarTheme(
            backgroundColor: Color(0xFFFFF7FB),
            foregroundColor: Color(0xFF594157),
            elevation: 0,
            centerTitle: true,
            titleTextStyle: TextStyle(
              color: Color(0xFF594157),
              fontSize: 22,
              fontWeight: FontWeight.w800,
            ),
          ),
          elevatedButtonTheme: ElevatedButtonThemeData(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFFF8DB7),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(22),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              textStyle: const TextStyle(fontWeight: FontWeight.w800),
            ),
          ),
          inputDecorationTheme: InputDecorationTheme(
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(20),
              borderSide: BorderSide.none,
            ),
          ),
        ),
        home: const HomeScreen(),
      ),
    );
  }
}
