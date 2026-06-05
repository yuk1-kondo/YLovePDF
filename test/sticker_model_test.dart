import 'package:flutter_test/flutter_test.dart';
import 'package:sticker_pocket/models/sticker.dart';

void main() {
  test('Sticker defaults future exchange fields', () {
    final sticker = Sticker(
      id: 'id-1',
      name: 'sample',
      imagePath: '/tmp/sample.jpg',
      createdAt: DateTime(2026, 6, 5),
    );

    expect(sticker.tradeCount, 0);
    expect(sticker.rarity, 1);
  });
}
