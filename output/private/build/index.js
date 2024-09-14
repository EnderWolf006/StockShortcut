"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const block_basekit_server_api_1 = require("@lark-opdev/block-basekit-server-api");
const stock_api_1 = require("stock-api");
const tencent = stock_api_1.stocks.tencent;
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
                'label.outField.close': '收盘价',
                'label.outField.high': '最高价',
                'label.outField.low': '最低价',
                'label.outField.volume': '成交量(股)',
            },
            'en-US': {
                'label.fieldSelect.stock': 'Please select the field where the stock code is located',
                'label.fieldSelect.date': 'Please select the field where the date is located',
                'label.outField.open': 'Opening price',
                'label.outField.close': 'Closing price',
                'label.outField.high': 'High price',
                'label.outField.low': 'Low price',
                'label.outField.volume': 'Volume (shares)',
            },
            'ja-JP': {
                'label.fieldSelect.stock': 'ストックコードのフィールドを選択してください',
                'label.fieldSelect.date': '日付のフィールドを選択してください',
                'label.outField.open': '始値',
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
            component: block_basekit_server_api_1.FieldComponent.FieldSelect,
            props: {
                supportType: [block_basekit_server_api_1.FieldType.Text],
            },
            validator: {
                required: true,
            }
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
                light: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/eqgeh7upeubqnulog/chatbot.svg',
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
                    primary: true,
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
                }
            ],
        },
    },
    // formItemParams 为运行时传入的字段参数，对应字段配置里的 formItems （如引用的依赖字段）
    execute: async (formItemParams, context) => {
        try {
            let { stock, date } = formItemParams;
            stock = stock[0].text;
            console.log(`Step 1: 获取到入参 ${stock} ${date}`);
            const res = await tencent.searchStocks([stock]);
            if (res.length) {
                stock = res[0].code.toLowerCase();
            }
            console.log(`Step 2: 获取到股票查询结果 ${stock}`);
            const scale = 240;
            let len = 1 + Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
            if (len < 0)
                throw new Error("只能查询今天或历史信息");
            let api = `https://quotes.sina.cn/cn/api/jsonp_v2.php/var%20_${stock}_${scale}_${new Date().getTime()}=/CN_MarketDataService.getKLineData?symbol=${stock}&scale=${scale}&ma=no&datalen=${len}`;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtRkFBK0o7QUFDL0oseUNBQW1DO0FBQ25DLE1BQU0sT0FBTyxHQUFHLGtCQUFNLENBQUMsT0FBTyxDQUFDO0FBQy9CLE1BQU0sRUFBRSxDQUFDLEVBQUUsR0FBRyxnQ0FBSyxDQUFDO0FBRXBCLDJCQUEyQjtBQUMzQixrQ0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLGFBQWEsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7QUFFOUUsa0NBQU8sQ0FBQyxRQUFRLENBQUM7SUFDZixnQkFBZ0I7SUFDaEIsSUFBSSxFQUFFO1FBQ0osUUFBUSxFQUFFO1lBQ1IsT0FBTyxFQUFFO2dCQUNQLHlCQUF5QixFQUFFLGFBQWE7Z0JBQ3hDLHdCQUF3QixFQUFFLFdBQVc7Z0JBQ3JDLHFCQUFxQixFQUFFLEtBQUs7Z0JBQzVCLHNCQUFzQixFQUFFLEtBQUs7Z0JBQzdCLHFCQUFxQixFQUFFLEtBQUs7Z0JBQzVCLG9CQUFvQixFQUFFLEtBQUs7Z0JBQzNCLHVCQUF1QixFQUFFLFFBQVE7YUFDbEM7WUFDRCxPQUFPLEVBQUU7Z0JBQ1AseUJBQXlCLEVBQUUseURBQXlEO2dCQUNwRix3QkFBd0IsRUFBRSxtREFBbUQ7Z0JBQzdFLHFCQUFxQixFQUFFLGVBQWU7Z0JBQ3RDLHNCQUFzQixFQUFFLGVBQWU7Z0JBQ3ZDLHFCQUFxQixFQUFFLFlBQVk7Z0JBQ25DLG9CQUFvQixFQUFFLFdBQVc7Z0JBQ2pDLHVCQUF1QixFQUFFLGlCQUFpQjthQUMzQztZQUNELE9BQU8sRUFBRTtnQkFDUCx5QkFBeUIsRUFBRSx3QkFBd0I7Z0JBQ25ELHdCQUF3QixFQUFFLG1CQUFtQjtnQkFDN0MscUJBQXFCLEVBQUUsSUFBSTtnQkFDM0Isc0JBQXNCLEVBQUUsSUFBSTtnQkFDNUIscUJBQXFCLEVBQUUsS0FBSztnQkFD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