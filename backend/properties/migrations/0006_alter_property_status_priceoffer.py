# Generated by Django 4.2.19 on 2025-03-04 09:27

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('properties', '0005_remove_property_price_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='property',
            name='status',
            field=models.CharField(choices=[('pending', 'Pending Admin Review'), ('eval_pending', 'Pending Evaluation'), ('approved', 'Approved & Available'), ('price_proposed', 'Price Proposed'), ('in_progress', 'Work In Progress'), ('completed', 'Work Completed'), ('rejected', 'Rejected')], default='pending', max_length=20),
        ),
        migrations.CreateModel(
            name='PriceOffer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('description', models.TextField(blank=True)),
                ('proposed_at', models.DateTimeField(auto_now_add=True)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('rejected', 'Rejected')], default='pending', max_length=20)),
                ('contractor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='price_offers', to='properties.contractor')),
                ('property', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='price_offers', to='properties.property')),
            ],
            options={
                'ordering': ['-proposed_at'],
            },
        ),
    ]
