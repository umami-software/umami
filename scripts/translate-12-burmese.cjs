const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'intl', 'messages');
const enUS = JSON.parse(fs.readFileSync(path.join(dir, 'en-US.json'), 'utf8'));

const translations = {
  'my-MM': {
    label: {
      // A
      'account': 'အကောင့်',
      'action': 'လုပ်ဆောင်ချက်',
      'add-board': 'ဘုတ်ထည့်မည်',
      'add-link': 'လင့်ခ်ထည့်မည်',
      'add-member': 'အဖွဲ့ဝင်ထည့်မည်',
      'add-pixel': 'Pixel ထည့်မည်',
      'add-step': 'အဆင့်ထည့်မည်',
      'affiliate': 'တွဲဖက်မိတ်ဖက်',
      'analysis': 'ခွဲခြမ်းစိတ်ဖြာမှု',
      'application': 'အပလီကေးရှင်း',
      'apply': 'အသုံးပြုမည်',
      'attribution': 'အရင်းအမြစ်ခွဲခြားခြင်း',
      'attribution-description': 'သင့်မားကတ်တင်းနှင့် အသုံးပြုသူများ မည်သို့ဆက်ဆံသည်နှင့် ပြောင်းလဲမှုကို မောင်းနှင်သည့်အရာများကို ကြည့်ပါ။',
      'audience': 'ပရိသတ်',
      // B
      'boards': 'ဘုတ်များ',
      'browser': 'ဘရောင်ဇာ',
      // C
      'campaign': 'ကမ်ပိန်း',
      'campaigns': 'ကမ်ပိန်းများ',
      'channel': 'ချန်နယ်',
      'channels': 'ချန်နယ်များ',
      'chart': 'ဇယား',
      'city': 'မြို့',
      'cohort': 'အုပ်စု',
      'cohorts': 'အုပ်စုများ',
      'compare': 'နှိုင်းယှဉ်မည်',
      'compare-dates': 'ရက်စွဲများ နှိုင်းယှဉ်မည်',
      'content': 'အကြောင်းအရာ',
      'conversion': 'ပြောင်းလဲမှု',
      'conversion-rate': 'ပြောင်းလဲမှုနှုန်း',
      'conversion-step': 'ပြောင်းလဲမှုအဆင့်',
      'count': 'အရေအတွက်',
      'country': 'နိုင်ငံ',
      'create': 'ဖန်တီးမည်',
      'created-by': 'ဖန်တီးသူ',
      'criteria': 'စံသတ်မှတ်ချက်',
      'currency': 'ငွေကြေး',
      'current': 'လက်ရှိ',
      // D
      'date': 'ရက်စွဲ',
      'day': 'ရက်',
      'delete-report': 'အစီရင်ခံစာ ဖျက်မည်',
      'destination-url': 'ဦးတည်ရာ URL',
      'device': 'ကိရိယာ',
      'direct': 'တိုက်ရိုက်',
      'distinct-id': 'ထူးခြား ID',
      'documentation': 'စာရွက်စာတမ်း',
      'does-not-include': 'မပါဝင်ပါ',
      'doest-not-exist': 'မတည်ရှိပါ',
      'download': 'ဒေါင်းလုဒ်လုပ်မည်',
      'dropoff': 'ထွက်ခွာမှု',
      // E
      'edit-member': 'အဖွဲ့ဝင် ပြင်ဆင်မည်',
      'email': 'အီးမေးလ်',
      'end-step': 'အဆုံးအဆင့်',
      'environment': 'ပတ်ဝန်းကျင်',
      'event-name': 'အဖြစ်အပျက်အမည်',
      'exclude-bounce': 'Bounce ဖယ်ထုတ်မည်',
      'exists': 'တည်ရှိသည်',
      // F
      'filter': 'စစ်ထုတ်မည်',
      'first-click': 'ပထမဆုံးနှိပ်ချက်',
      'first-seen': 'ပထမဆုံးတွေ့ရှိချိန်',
      'funnel-description': 'အသုံးပြုသူများ၏ ပြောင်းလဲမှုနှင့် ထွက်ခွာမှုနှုန်းကို နားလည်ပါ။',
      'funnels': 'ဖန်နယ်များ',
      // G
      'goal': 'ပန်းတိုင်',
      'goals': 'ပန်းတိုင်များ',
      'goals-description': 'စာမျက်နှာကြည့်ရှုမှုနှင့် အဖြစ်အပျက်များအတွက် ပန်းတိုင်များကို ခြေရာခံပါ။',
      'grouped': 'အုပ်စုဖွဲ့ထားသော',
      'growth': 'တိုးတက်မှု',
      // H
      'hostname': 'လက်ခံဆာဗာအမည်',
      'hour': 'နာရီ',
      // I
      'includes': 'ပါဝင်သည်',
      'insight': 'ထိုးထွင်းသိမြင်မှု',
      'insights-description': 'အပိုင်းခွဲများနှင့် စစ်ထုတ်ချက်များကို အသုံးပြု၍ သင့်ဒေတာကို ပိုမိုနက်ရှိုင်းစွာ လေ့လာပါ။',
      'invalid-url': 'မမှန်ကန်သော URL',
      'is': 'ဖြစ်သည်',
      'is-false': 'မှားသည်',
      'is-not': 'မဟုတ်ပါ',
      'is-not-set': 'သတ်မှတ်မထားပါ',
      'is-set': 'သတ်မှတ်ထားသည်',
      'is-true': 'မှန်သည်',
      // J
      'journey': 'ခရီးလမ်း',
      'journey-description': 'အသုံးပြုသူများ သင့်ဝက်ဘ်ဆိုဒ်ကို မည်သို့လှည့်လည်သည်ကို နားလည်ပါ။',
      'journeys': 'ခရီးလမ်းများ',
      // L
      'last-click': 'နောက်ဆုံးနှိပ်ချက်',
      'last-months': 'လွန်ခဲ့သော {x} လက',
      'last-seen': 'နောက်ဆုံးတွေ့ရှိချိန်',
      'link': 'လင့်ခ်',
      'links': 'လင့်ခ်များ',
      'location': 'တည်နေရာ',
      // M
      'manage': 'စီမံမည်',
      'manager': 'မန်နေဂျာ',
      'medium': 'မီဒီယမ်',
      'member': 'အဖွဲ့ဝင်',
      'minute': 'မိနစ်',
      'model': 'မော်ဒယ်',
      'month': 'လ',
      'my-account': 'ကျွန်ုပ်၏အကောင့်',
      'my-websites': 'ကျွန်ုပ်၏ဝက်ဘ်ဆိုဒ်များ',
      // N
      'number-of-records': '{x} {x, plural, one {မှတ်တမ်း} other {မှတ်တမ်းများ}}',
      // O
      'ok': 'OK',
      'online': 'အွန်လိုင်း',
      'organic-search': 'သဘာဝရှာဖွေမှု',
      'organic-shopping': 'သဘာဝစျေးဝယ်မှု',
      'organic-social': 'သဘာဝဆိုရှယ်',
      'organic-video': 'သဘာဝဗီဒီယို',
      'other': 'အခြား',
      // P
      'page': 'စာမျက်နှာ',
      'page-of': 'စာမျက်နှာ {current} / {total}',
      'pageTitle': 'စာမျက်နှာခေါင်းစဥ်',
      'paid-ads': 'ငွေပေးကြော်ငြာ',
      'paid-search': 'ငွေပေးရှာဖွေမှု',
      'paid-shopping': 'ငွေပေးစျေးဝယ်မှု',
      'paid-social': 'ငွေပေးဆိုရှယ်',
      'paid-video': 'ငွေပေးဗီဒီယို',
      'path': 'လမ်းကြောင်း',
      'paths': 'လမ်းကြောင်းများ',
      'pixel': 'Pixel',
      'pixels': 'Pixel များ',
      'preferences': 'စိတ်ကြိုက်ဆက်တင်များ',
      'previous': 'ယခင်',
      'previous-period': 'ယခင်ကာလ',
      'previous-year': 'ယခင်နှစ်',
      'profiles': 'ပရိုဖိုင်းများ',
      'properties': 'ဂုဏ်သတ္တိများ',
      'property': 'ဂုဏ်သတ္တိ',
      // R
      'referral': 'ရည်ညွှန်းမှု',
      'referrer': 'ရည်ညွှန်းသူ',
      'region': 'ဒေသ',
      'remaining': 'ကျန်ရှိနေသော',
      'remove-member': 'အဖွဲ့ဝင်ကို ဖယ်ရှားမည်',
      'retention': 'ထိန်းသိမ်းနိုင်မှု',
      'retention-description': 'အသုံးပြုသူများ မည်မျှမကြာခဏ ပြန်လာသည်ကို ခြေရာခံ၍ သင့်ဝက်ဘ်ဆိုဒ်၏ ဆွဲဆောင်နိုင်မှုကို တိုင်းတာပါ။',
      'revenue': 'ဝင်ငွေ',
      // S
      'save-cohort': 'အုပ်စုသိမ်းမည်',
      'save-segment': 'အပိုင်းခွဲသိမ်းမည်',
      'screen': 'မျက်နှာပြင်',
      'search': 'ရှာဖွေမည်',
      'segment': 'အပိုင်းခွဲ',
      'segments': 'အပိုင်းခွဲများ',
      'select': 'ရွေးချယ်မည်',
      'select-filter': 'စစ်ထုတ်ချက်ရွေးမည်',
      'select-role': 'အခန်းကဏ္ဍရွေးမည်',
      'session': 'ဆက်ရှင်',
      'session-data': 'ဆက်ရှင်ဒေတာ',
      'share': 'မျှဝေမည်',
      'sms': 'SMS',
      'source': 'အရင်းအမြစ်',
      'sources': 'အရင်းအမြစ်များ',
      'start-step': 'စတင်အဆင့်',
      'steps': 'အဆင့်များ',
      'support': 'ပံ့ပိုးကူညီမှု',
      'switch-account': 'အကောင့်ပြောင်းမည်',
      // T
      'table': 'ဇယား',
      'tag': 'တဂ်',
      'tags': 'တဂ်များ',
      'team-manager': 'အသင်းမန်နေဂျာ',
      'team-name': 'အသင်းအမည်',
      'team-settings': 'အသင်းဆက်တင်များ',
      'team-view-only': 'အသင်း ကြည့်ရှုမှုသာ',
      'team-websites': 'အသင်းဝက်ဘ်ဆိုဒ်များ',
      'term': 'စည်းကမ်း',
      'terms': 'စည်းကမ်းများ',
      'traffic': 'အသွားအလာ',
      'transactions': 'ငွေလွှဲမှုများ',
      'transfer': 'လွှဲပြောင်းမည်',
      'transfer-website': 'ဝက်ဘ်ဆိုဒ်လွှဲပြောင်းမည်',
      // U
      'unique': 'ထူးခြားသော',
      'unique-events': 'ထူးခြားအဖြစ်အပျက်များ',
      'uniqueCustomers': 'ထူးခြားဖောက်သည်များ',
      'update': 'အပ်ဒိတ်လုပ်မည်',
      'url': 'URL',
      'utm': 'UTM',
      'utm-campaign': 'UTM ကမ်ပိန်း',
      'utm-content': 'UTM အကြောင်းအရာ',
      'utm-description': 'UTM ပါရာမီတာများမှတစ်ဆင့် သင့်ကမ်ပိန်းများကို ခြေရာခံပါ။',
      'utm-medium': 'UTM မီဒီယမ်',
      'utm-source': 'UTM အရင်းအမြစ်',
      'utm-term': 'UTM စည်းကမ်း',
      // V
      'version': 'ဗားရှင်း',
      'views-per-visit': 'လည်ပတ်မှုတစ်ခုလျှင် ကြည့်ရှုမှု',
      'visits': 'လည်ပတ်မှုများ',
    },
    message: {
      'action-confirmation': 'အတည်ပြုရန် အောက်ပါအကွက်တွင် {confirmation} ကို ရိုက်ထည့်ပါ။',
      'bad-request': 'မမှန်ကန်သောတောင်းဆိုမှု',
      'collected-data': 'စုဆောင်းထားသောဒေတာ',
      'confirm-remove': '<b>{target}</b> ကို ဖယ်ရှားလိုသည်မှာ သေချာပါသလား?',
      'delete-team-warning': 'အသင်းကိုဖျက်ပါက အသင်းဝက်ဘ်ဆိုဒ်များအားလုံးကိုပါ ဖျက်ပစ်မည်။',
      'forbidden': 'ခွင့်ပြုချက်မရှိပါ',
      'not-found': 'ရှာမတွေ့ပါ',
      'nothing-selected': 'ဘာမှရွေးမထားပါ။',
      'sever-error': 'ဆာဗာအမှားအယွင်း',
      'transfer-team-website-to-user': 'ဤဝက်ဘ်ဆိုဒ်ကို သင့်အကောင့်သို့ လွှဲပြောင်းမလား?',
      'transfer-user-website-to-team': 'ဤဝက်ဘ်ဆိုဒ်ကို လွှဲပြောင်းမည့် အသင်းကို ရွေးချယ်ပါ။',
      'transfer-website': 'ဝက်ဘ်ဆိုဒ်ပိုင်ဆိုင်မှုကို သင့်အကောင့် သို့မဟုတ် အခြားအသင်းသို့ လွှဲပြောင်းပါ။',
      'triggered-event': 'အစပျိုးလိုက်သော အဖြစ်အပျက်',
      'unauthorized': 'ခွင့်ပြုချက်မရှိပါ',
      'viewed-page': 'ကြည့်ရှုခဲ့သောစာမျက်နှာ',
    }
  }
};

for (const [locale, trans] of Object.entries(translations)) {
  const filePath = path.join(dir, locale + '.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let count = 0;
  for (const [section, keys] of Object.entries(trans)) {
    for (const [key, value] of Object.entries(keys)) {
      if (data[section] && key in data[section]) {
        data[section][key] = value;
        count++;
      }
    }
  }
  const sorted = {};
  for (const section of Object.keys(enUS)) {
    if (data[section]) {
      sorted[section] = {};
      for (const key of Object.keys(enUS[section])) {
        if (key in data[section]) sorted[section][key] = data[section][key];
      }
      for (const key of Object.keys(data[section])) {
        if (!(key in sorted[section])) sorted[section][key] = data[section][key];
      }
    }
  }
  fs.writeFileSync(filePath, JSON.stringify(sorted, null, 2) + '\n', 'utf8');
  console.log('Updated ' + locale + ': ' + count + ' keys');
}
