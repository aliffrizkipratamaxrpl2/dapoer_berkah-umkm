import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/category_provider.dart';
import '../../config/theme.dart';
import '../../models/category_model.dart';

class CategoryFormScreen extends StatefulWidget {
  final CategoryModel? category;

  const CategoryFormScreen({super.key, this.category});

  @override
  State<CategoryFormScreen> createState() => _CategoryFormScreenState();
}

class _CategoryFormScreenState extends State<CategoryFormScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _descController;
  bool get isEdit => widget.category != null;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.category?.name ?? '');
    _descController = TextEditingController(text: widget.category?.description ?? '');
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descController.dispose();
    super.dispose();
  }

  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) return;

    final provider = Provider.of<CategoryProvider>(context, listen: false);
    final name = _nameController.text.trim();
    final desc = _descController.text.trim();

    bool success;
    if (isEdit) {
      success = await provider.updateCategory(widget.category!.id, name, desc.isNotEmpty ? desc : null);
    } else {
      success = await provider.addCategory(name, desc.isNotEmpty ? desc : null);
    }

    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(isEdit ? 'Kategori berhasil diperbarui.' : 'Kategori baru berhasil ditambahkan.'),
          backgroundColor: AppTheme.secondaryColor,
        ),
      );
      Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(provider.errorMessage ?? 'Gagal menyimpan kategori.'),
          backgroundColor: Colors.redAccent,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final catProvider = Provider.watch<CategoryProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(isEdit ? 'Edit Kategori' : 'Tambah Kategori'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'Nama Kategori *',
                  hintText: 'Contoh: Makanan Utama, Minuman, Paket Hemat',
                  prefixIcon: Icon(Icons.category_outlined),
                ),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) return 'Nama kategori wajib diisi';
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _descController,
                maxLines: 4,
                decoration: const InputDecoration(
                  labelText: 'Deskripsi Kategori',
                  hintText: 'Penjelasan singkat tentang kategori ini (opsional)',
                  prefixIcon: Icon(Icons.description_outlined),
                  alignLabelWithHint: true,
                ),
              ),
              const SizedBox(height: 30),
              ElevatedButton(
                onPressed: catProvider.isLoading ? null : _handleSave,
                child: catProvider.isLoading
                    ? const SizedBox(
                        height: 22,
                        width: 22,
                        child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white),
                      )
                    : Text(isEdit ? 'Simpan Perubahan' : 'Tambah Kategori'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

