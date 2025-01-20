"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const block_basekit_server_api_1 = require("@lark-opdev/block-basekit-server-api");
const { t } = block_basekit_server_api_1.field;
// 通过addDomainList添加请求接口的域名
block_basekit_server_api_1.basekit.addDomainList(['quotes.sina.cn', 'qt.gtimg.cn', 'smartbox.gtimg.cn']);
block_basekit_server_api_1.basekit.addField({
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
                'label.tooltips.text': '股票代码格式说明',
                'label.tooltips.link': '点我跳转',
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
                'label.tooltips.text': 'Stock code format description',
                'label.tooltips.link': 'Click here to jump',
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
                'label.tooltips.text': 'ストックコードのフォーマット説明',
                'label.tooltips.link': 'こちらをクリック',
            },
        }
    },
    // 定义捷径的入参
    formItems: [
        {
            key: 'stock',
            label: t('label.fieldSelect.stock'),
            component: block_basekit_server_api_1.FieldComponent.FieldSelect,
            props: {
                supportType: [block_basekit_server_api_1.FieldType.Text],
            },
            validator: {
                required: true,
            },
            tooltips: [
                {
                    type: 'text',
                    content: t('label.tooltips.text'),
                },
                {
                    type: 'link',
                    text: t('label.tooltips.link'),
                    link: 'https://feishu.feishu.cn/docx/FYjGdefpcokLqQxwPGIcs0lIngf'
                }
            ],
        },
        {
            key: 'date',
            label: t('label.fieldSelect.date'),
            component: block_basekit_server_api_1.FieldComponent.FieldSelect,
            props: {
                supportType: [block_basekit_server_api_1.FieldType.DateTime],
            },
            validator: {
                required: true,
            }
        },
    ],
    // 定义捷径的返回结果类型
    resultType: {
        type: block_basekit_server_api_1.FieldType.Object,
        extra: {
            icon: {
                light: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/abjayvoz/ljhwZthlaukjlkulzlp/2024q3/gupiaonew.png?x-resource-account=public',
            },
            properties: [
                {
                    key: 'group',
                    type: block_basekit_server_api_1.FieldType.Text,
                    title: t('label.outField.open'),
                    isGroupByKey: true,
                    hidden: true
                },
                {
                    key: 'open',
                    type: block_basekit_server_api_1.FieldType.Number,
                    title: t('label.outField.open'),
                    extra: {
                        formatter: block_basekit_server_api_1.NumberFormatter.DIGITAL_ROUNDED_2
                    },
                },
                {
                    key: 'high',
                    type: block_basekit_server_api_1.FieldType.Number,
                    title: t('label.outField.high'),
                    extra: {
                        formatter: block_basekit_server_api_1.NumberFormatter.DIGITAL_ROUNDED_2
                    }
                },
                {
                    key: 'low',
                    type: block_basekit_server_api_1.FieldType.Number,
                    title: t('label.outField.low'),
                    extra: {
                        formatter: block_basekit_server_api_1.NumberFormatter.DIGITAL_ROUNDED_2
                    }
                },
                {
                    key: 'close',
                    type: block_basekit_server_api_1.FieldType.Number,
                    title: t('label.outField.close'),
                    extra: {
                        formatter: block_basekit_server_api_1.NumberFormatter.DIGITAL_ROUNDED_2
                    }
                },
                {
                    key: 'volume',
                    type: block_basekit_server_api_1.FieldType.Number,
                    title: t('label.outField.volume'),
                    extra: {
                        formatter: block_basekit_server_api_1.NumberFormatter.INTEGER
                    }
                },
                {
                    key: 'code',
                    type: block_basekit_server_api_1.FieldType.Text,
                    title: '股票代码',
                    primary: true,
                },
            ],
        },
    },
    // formItemParams 为运行时传入的字段参数，对应字段配置里的 formItems （如引用的依赖字段）
    execute: async (formItemParams, context) => {
        try {
            let { stock, date } = formItemParams;
            stock = stock[0].text;
            console.log(`Step 1: 获取到入参 ${stock} ${date}`);
            const searchApi = "https://smartbox.gtimg.cn/s3/?v=2&t=all&c=1&q=" + stock;
            let res = await (await (await context.fetch(searchApi, { method: 'GET' }))).text();
            let rows = res.replace('v_hint="', "").replace('"', "").split("^");
            let codes = rows.map(function (row) {
                let _a = row.split("~"), type = _a[0], code = _a[1];
                switch (type) {
                    case "sz":
                        return "SZ" + code;
                    case "sh":
                        return "SH" + code;
                    case "hk":
                        return "HK" + code;
                    case "us":
                        return "US" + code.split(".")[0].toUpperCase() + code;
                    default:
                        return code;
                }
            });
            if (!Number.isNaN(Number(stock))) {
                stock = codes[0];
            }
            stock = stock.toLowerCase();
            console.log(`Step 2: 获取到股票查询结果 ${stock}`);
            const scale = 240;
            let len = 1 + Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
            if (len < 0)
                throw new Error("只能查询今天或历史信息");
            let api = `https://quotes.sina.cn/cn/api/jsonp_v2.php/var%20_${stock}_${scale}_${new Date(date).getTime()}=/CN_MarketDataService.getKLineData?symbol=${stock}&scale=${scale}&ma=no&datalen=${1}`;
            console.log(`Step 3: 合成api url ${api}`);
            let data = await (await (await context.fetch(api, { method: 'GET' }))).text();
            const { open, high, low, close, volume } = JSON.parse(data.split('=(')[1].replace(');', ''))[0];
            console.log(`Step 4: 解析返回数据 ${open} ${high} ${low} ${close} ${volume}`);
            return {
                code: block_basekit_server_api_1.FieldCode.Success,
                data: {
                    group: String(new Date().getTime()),
                    open: Number(open),
                    high: Number(high),
                    low: Number(low),
                    close: Number(close),
                    volume: Number(volume),
                    code: stock
                }
            };
        }
        catch (error) {
            console.log(`报错: ${error}`);
            return {
                code: block_basekit_server_api_1.FieldCode.Error,
            };
        }
    },
});
exports.default = block_basekit_server_api_1.basekit;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtRkFBK0o7QUFDL0osTUFBTSxFQUFFLENBQUMsRUFBRSxHQUFHLGdDQUFLLENBQUM7QUFFcEIsMkJBQTJCO0FBQzNCLGtDQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFLG1CQUFtQixDQUFDLENBQUMsQ0FBQztBQUU5RSxrQ0FBTyxDQUFDLFFBQVEsQ0FBQztJQUNmLGdCQUFnQjtJQUNoQixJQUFJLEVBQUU7UUFDSixRQUFRLEVBQUU7WUFDUixPQUFPLEVBQUU7Z0JBQ1AseUJBQXlCLEVBQUUsYUFBYTtnQkFDeEMsd0JBQXdCLEVBQUUsV0FBVztnQkFDckMscUJBQXFCLEVBQUUsS0FBSztnQkFDNUIscUJBQXFCLEVBQUUsTUFBTTtnQkFDN0Isc0JBQXNCLEVBQUUsS0FBSztnQkFDN0IscUJBQXFCLEVBQUUsS0FBSztnQkFDNUIsb0JBQW9CLEVBQUUsS0FBSztnQkFDM0IsdUJBQXVCLEVBQUUsUUFBUTtnQkFDakMscUJBQXFCLEVBQUUsVUFBVTtnQkFDakMscUJBQXFCLEVBQUUsTUFBTTthQUM5QjtZQUNELE9BQU8sRUFBRTtnQkFDUCx5QkFBeUIsRUFBRSx5REFBeUQ7Z0JBQ3BGLHdCQUF3QixFQUFFLG1EQUFtRDtnQkFDN0UscUJBQXFCLEVBQUUsZUFBZTtnQkFDdEMscUJBQXFCLEVBQUUsWUFBWTtnQkFDbkMsc0JBQXNCLEVBQUUsZUFBZTtnQkFDdkMscUJBQXFCLEVBQUUsWUFBWTtnQkFDbkMsb0JBQW9CLEVBQUUsV0FBVztnQkFDakMsdUJBQXVCLEVBQUUsaUJBQWlCO2dCQUMxQyxxQkFBcUIsRUFBRSwrQkFBK0I7Z0JBQ3RELHFCQUFxQixFQUFFLG9CQUFvQjthQUM1QztZQUNELE9BQU8sRUFBRTtnQkFDUCx5QkFBeUIsRUFBRSx3QkFBd0I7Z0JBQ25ELHdC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