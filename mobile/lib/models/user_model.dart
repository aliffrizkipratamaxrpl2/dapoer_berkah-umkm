class UserModel {
  final int id;
  final String name;
  final String email;
  final String role; // 'admin' atau 'kasir'

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
  });

  bool get isAdmin => role.toLowerCase() == 'admin';
  bool get isKasir => role.toLowerCase() == 'kasir';

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 'kasir',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'role': role,
    };
  }
}

