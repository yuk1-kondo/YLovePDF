import 'package:flutter/material.dart';

class PastelBackground extends StatelessWidget {
  const PastelBackground({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFFFFF7FB), Color(0xFFFFF0D9), Color(0xFFEAF7FF)],
        ),
      ),
      child: child,
    );
  }
}
