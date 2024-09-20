import { basekit, FieldType, field, FieldComponent, FieldCode, NumberFormatter, AuthorizationType, DateFormatter } from '@lark-opdev/block-basekit-server-api';
const { t } = field;

// 通过addDomainList添加请求接口的域名
basekit.addDomainList(['quotes.sina.cn', 'qt.gtimg.cn', 'smartbox.gtimg.cn']);

basekit.addField({
  // 定义捷径的i18n语言资源
  i18n: {
    messages: {
      'zh-CN': {
        'label.fieldSelect.stock': '请选择股票代码所在字段',
        'label.fieldSelect.date': '请选择日期所在字段',
        'label.outField.open': '开盘价',
        'label.outField.name': '股票名称',
        'label.outField.close': '收盘价',
        'label.outField.high': '最高价',
        'label.outField.low': '最低价',
        'label.outField.volume': '成交量(股)',
      },
      'en-US': {
        'label.fieldSelect.stock': 'Please select the field where the stock code is located',
        'label.fieldSelect.date': 'Please select the field where the date is located',
        'label.outField.open': 'Opening price',
        'label.outField.name': 'Stock name',
        'label.outField.close': 'Closing price',
        'label.outField.high': 'High price',
        'label.outField.low': 'Low price',
        'label.outField.volume': 'Volume (shares)',
      },
      'ja-JP': {
        'label.fieldSelect.stock': 'ストックコードのフィールドを選択してください',
        'label.fieldSelect.date': '日付のフィールドを選択してください',
        'label.outField.open': '始値',
        'label.outField.name': '銘柄名',
        'label.outField.close': '終値',
        'label.outField.high': '最高値',
        'label.outField.low': '最安値',
        'label.outField.volume': '出来高',
      },
    }
  },
  // 定义捷径的入参
  formItems: [
    {
      key: 'stock',
      label: t('label.fieldSelect.stock'),
      component: FieldComponent.FieldSelect,
      props: {
        supportType: [FieldType.Text],
      },
      validator: {
        required: true,
      },
      tooltips: [
        {
          type: 'text',
          content: '股票代码格式说明'
        },
        {
          type: 'link',
          text: '点我跳转',
          link: 'https://feishu.feishu.cn/docx/FYjGdefpcokLqQxwPGIcs0lIngf'
        }
      ] as any,
    },
    {
      key: 'date',
      label: t('label.fieldSelect.date'),
      component: FieldComponent.FieldSelect,
      props: {
        supportType: [FieldType.DateTime],
      },
      validator: {
        required: true,
      }
    },
  ],
  // 定义捷径的返回结果类型
  resultType: {
    type: FieldType.Object,
    extra: {
      icon: {
        light: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/abjayvoz/ljhwZthlaukjlkulzlp/2024q3/gupiaonew.png?x-resource-account=public',
      },
      properties: [
        {
          key: 'group',
          type: FieldType.Text,
          title: t('label.outField.open'),
          isGroupByKey: true,
          hidden: true
        },

        {
          key: 'name',
          type: FieldType.Text,
          title: t('label.outField.name'),
          primary: true,
        },
        {
          key: 'open',
          type: FieldType.Number,
          title: t('label.outField.open'),
          extra: {
            formatter: NumberFormatter.DIGITAL_ROUNDED_2
          },
        },
        {
          key: 'high',
          type: FieldType.Number,
          title: t('label.outField.high'),
          extra: {
            formatter: NumberFormatter.DIGITAL_ROUNDED_2
          }
        },
        {
          key: 'low',
          type: FieldType.Number,
          title: t('label.outField.low'),
          extra: {
            formatter: NumberFormatter.DIGITAL_ROUNDED_2
          }
        },
        {
          key: 'close',
          type: FieldType.Number,
          title: t('label.outField.close'),
          extra: {
            formatter: NumberFormatter.DIGITAL_ROUNDED_2
          }
        },
        {
          key: 'volume',
          type: FieldType.Number,
          title: t('label.outField.volume'),
          extra: {
            formatter: NumberFormatter.INTEGER
          }
        }
      ],
    },
  },
  // formItemParams 为运行时传入的字段参数，对应字段配置里的 formItems （如引用的依赖字段）
  execute: async (formItemParams: any, context) => {
    try {
      let { stock, date } = formItemParams;
      stock = stock[0].text
      console.log(`Step 1: 获取到入参 ${stock} ${date}`);

      const searchApi = "https://smartbox.gtimg.cn/s3/?v=2&t=all&c=1&q=" + stock
      let res = await (await (await context.fetch(searchApi, { method: 'GET' }))).text()
      let rows = res.replace('v_hint="', "").replace('"', "").split("^");
      let name;
      let codes = rows.map(function (row: any) {
        let _a = row.split("~"), type = _a[0], code = _a[1]
        name = _a[2];
        switch (type) {
          case "sz":
            return "SZ" + code
          case "sh":
            return "SH" + code
          case "hk":
            return "HK" + code
          case "us":
            return "US" + code.split(".")[0].toUpperCase() + code;
          default:
            return code;
        }
      });
      if (!Number.isNaN(Number(stock))) {
        stock = codes[0]
      }
      stock = stock.toLowerCase()
      console.log(`Step 2: 获取到股票查询结果 ${stock}`);
      const scale = 240
      let len = 1 + Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
      if (len < 0) throw new Error("只能查询今天或历史信息");
      let api = `https://quotes.sina.cn/cn/api/jsonp_v2.php/var%20_${stock}_${scale}_${new Date().getTime()}=/CN_MarketDataService.getKLineData?symbol=${stock}&scale=${scale}&ma=no&datalen=${len}`;
      console.log(`Step 3: 合成api url ${api}`);

      let data = await (await (await context.fetch(api, { method: 'GET' }))).text();
      const { open, high, low, close, volume } = JSON.parse(data.split('=(')[1].replace(');', ''))[0]
      console.log(`Step 4: 解析返回数据 ${open} ${high} ${low} ${close} ${volume} ${JSON.parse('"' + name + '"')}`);
      return {
        code: FieldCode.Success,
        data: {
          group: String(new Date().getTime()),
          name: JSON.parse('"' + name + '"'),
          open: Number(open),
          high: Number(high),
          low: Number(low),
          close: Number(close),
          volume: Number(volume),
        }
      }
    } catch (error) {
      console.log(`报错: ${error}`);
      return {
        code: FieldCode.Error,
      };
    }
  },
});
export default basekit;