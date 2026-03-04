/**
 * FAQScreen.js - Sıkça Sorulan Sorular Ekranı
 * Accordion sistemi ile açılır/kapanır sorular
 * Statik sağlık bilgileri içerir
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AccordionItem from '../components/AccordionItem';
import { COLORS } from '../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOW, FONT_SIZE } from '../constants/styles';

const FAQScreen = () => {
  const faqs = [
    {
      id: '1',
      title: 'Diyabet nedir?',
      content: 'Diyabet, vücudun glikoz (kan şekeri) kullanımını etkileyen kronik bir hastalıktır. İnsülin hormonu yetersiz üretildiğinde veya etkin kullanılamadığında kan şekeri yükselir. Tip 1 ve Tip 2 olmak üzere iki ana türü vardır.',
    },
    {
      id: '2',
      title: 'Normal kan şekeri değerleri nedir?',
      content: 'Açlık kan şekeri: 70-100 mg/dL (normal), Tokluk kan şekeri: 140 mg/dL\'nin altı (normal). 100-125 mg/dL arası prediyabet, 126 mg/dL ve üzeri diyabet olarak değerlendirilir. Düzenli ölçüm ve takip çok önemlidir.',
    },
    {
      id: '3',
      title: 'Diyabet belirtileri nelerdir?',
      content: 'Sık idrara çıkma, aşırı susama, açlık hissi, halsizlik, bulanık görme, yara iyileşmesinde gecikme, eller ve ayaklarda karıncalanma veya uyuşma, kilo kaybı (Tip 1\'de). Bu belirtileri fark ederseniz mutlaka doktora başvurun.',
    },
    {
      id: '4',
      title: 'Diyabetli birisi nasıl beslenmelidir?',
      content: 'Tam tahıllı gıdalar, sebzeler, meyveler (ölçülü), yağsız proteinler tüketin. Şekerli içecekler, işlenmiş gıdalar ve aşırı karbonhidrattan kaçının. Düzenli ve dengeli öğünler önemlidir. Bir diyetisyenle çalışmanız önerilir.',
    },
    {
      id: '5',
      title: 'Egzersiz kan şekerine nasıl etki eder?',
      content: 'Düzenli egzersiz insülin duyarlılığını artırır ve kan şekerini düşürür. Haftada en az 150 dakika orta tempolu egzersiz önerilir. Yürüyüş, yüzme, bisiklet gibi aktiviteler idealdir. Egzersiz öncesi ve sonrası kan şekerinizi kontrol edin.',
    },
    {
      id: '6',
      title: 'HbA1c testi nedir?',
      content: 'HbA1c (glikozillenmiş hemoglobin) testi, son 2-3 aydaki ortalama kan şekeri düzeyinizi gösterir. %5.7\'nin altı normal, %5.7-6.4 arası prediyabet, %6.5 ve üzeri diyabet olarak değerlendirilir. 3-6 ayda bir yapılması önerilir.',
    },
    {
      id: '7',
      title: 'Hipoglisemi (düşük kan şekeri) ne zaman olur?',
      content: 'Kan şekeri 70 mg/dL\'nin altına düştüğünde hipoglisemi meydana gelir. Titreme, terleme, kalp çarpıntısı, baş dönmesi, sinirlilik belirtileri gösterir. Hemen hızlı emilen şeker (meyve suyu, bal) alın ve 15 dakika sonra tekrar ölçün.',
    },
    {
      id: '8',
      title: 'Diyabette ayak bakımı neden önemlidir?',
      content: 'Diyabet sinir hasarına ve kan dolaşımı sorunlarına neden olabilir. Bu da ayaklarda duyu kaybı ve yara iyileşme problemlerine yol açar. Günlük ayak kontrolü yapın, rahat ayakkabılar giyin, yaraları hemen tedavi ettirin ve yalın ayak yürümeyin.',
    },
    {
      id: '9',
      title: 'Stres kan şekerini etkiler mi?',
      content: 'Evet, stres hormonları (kortizol, adrenalin) kan şekerini yükseltebilir. Düzenli uyku, meditasyon, nefes egzersizleri, hobiler ve sosyal aktiviteler stres yönetimine yardımcı olur. Kronik stres varsa profesyonel destek alın.',
    },
    {
      id: '10',
      title: 'Diyabet tedavi edilebilir mi?',
      content: 'Tip 1 diyabet şu an için tedavi edilemez ama iyi yönetilebilir. Tip 2 diyabet erken aşamada yaşam tarzı değişiklikleriyle kontrol altına alınabilir, hatta geri döndürülebilir. Her iki tipte de düzenli takip ve tedaviye uyum çok önemlidir.',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="help-circle" size={40} color={COLORS.primary} />
        <Text style={styles.headerTitle}>Sıkça Sorulan Sorular</Text>
        <Text style={styles.headerSubtitle}>
          Diyabet ve sağlıklı yaşam hakkında bilgiler
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {faqs.map((faq) => (
          <AccordionItem
            key={faq.id}
            title={faq.title}
            content={faq.content}
          />
        ))}

        <View style={styles.disclaimerCard}>
          <Ionicons name="medical" size={24} color={COLORS.primary} />
          <Text style={styles.disclaimerText}>
            Bu bilgiler genel amaçlıdır ve tıbbi tavsiye yerine geçmez. Sağlık sorunlarınız için mutlaka bir doktora başvurun.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOW.small,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  disclaimerCard: {
    backgroundColor: COLORS.primary + '15',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: SPACING.md,
  },
  disclaimerText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    lineHeight: 20,
  },
});

export default FAQScreen;
