USE [MaylisPromovent]
GO

/****** Object:  Table [dbo].[Pedidos]    Script Date: 02/11/2024 11:13:03 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Pedidos](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[FECHA_PEDIDO] [datetime] NULL,
	[PEDIDO] [nvarchar](255) NOT NULL,
	[Marca] [nvarchar](255) NULL,
	[Origen] [nvarchar](255) NULL,
	[ACCION] [nvarchar](255) NULL,
	[REF_CLIENTE] [nvarchar](255) NULL,
	[APE] [nvarchar](255) NULL,
	[NOM] [nvarchar](255) NULL,
	[TEL] [nvarchar](255) NULL,
	[SEXO] [nvarchar](255) NULL,
	[NOMBRE_COMPLETO] [nvarchar](255) NULL,
	[DIR1] [nvarchar](255) NULL,
	[DIR2] [nvarchar](255) NULL,
	[DIR3] [nvarchar](255) NULL,
	[DIR4] [nvarchar](255) NULL,
	[CP_POB] [nvarchar](255) NULL,
	[CP] [nvarchar](255) NULL,
	[POBLACION] [nvarchar](255) NULL,
	[PRIORITAIRE] [nvarchar](255) NULL,
	[TIPO_PAGO] [nvarchar](255) NULL,
	[TIT_CHEQUE] [nvarchar](255) NULL,
	[Banco] [nvarchar](255) NULL,
	[NUM_CHEQUE] [nvarchar](255) NULL,
	[IMP] [money] NULL,
	[TIT_TARJETA] [nvarchar](255) NULL,
	[VISA] [nvarchar](255) NULL,
	[NUM_TARJETA] [nvarchar](255) NULL,
	[CADUCIDAD] [nvarchar](255) NULL,
	[COD_VER] [nvarchar](255) NULL,
	[IMP_TARJ] [money] NULL,
	[IMP_EFECTIVO] [money] NULL,
	[IMP_MC] [money] NULL,
	[GESTION_COBRO] [nvarchar](255) NULL,
	[Facturado] [nvarchar](255) NULL,
	[LINEAS_PEDIDO] [nvarchar](255) NULL,
	[Peso] [float] NULL,
	[ENVIO] [money] NULL,
	[FRAIS] [money] NULL,
	[COBRADO] [bit] NOT NULL,
	[FECHA] [date] NULL,
	[TIPO_CLIENTE] [numeric](18, 0) NULL,
	[PARTICIPANTE] [nvarchar](255) NULL,
	[IMPORTE_PEDIDO] [money] NULL,
	[BI1] [money] NULL,
	[BI2] [money] NULL,
	[TVA1] [money] NULL,
	[TVA2] [money] NULL,
	[DEVOLUCION] [nvarchar](255) NULL,
	[TIPO_ENVIO] [nvarchar](255) NULL,
	[VALOR] [numeric](18, 0) NULL,
	[IMPAGADO] [bit] NOT NULL,
	[IMPORTE_IMPAGO] [money] NULL,
	[FECHA_IMPAGADO] [date] NULL,
	[RECOBRADO] [bit] NOT NULL,
	[IMPORTE_RECOBRADO] [money] NULL,
	[FECHA_RECOBRADO] [date] NULL,
	[INCOBRABLE] [bit] NOT NULL,
	[IMPORTE_INCOBRABLE] [money] NULL,
	[FECHA_INCOBRABLE] [date] NULL,
	[CALLCENTER] [bit] NOT NULL,
	[RESERVASTOCK] [bit] NOT NULL,
	[ULTIMA_CARTA] [nvarchar](255) NULL,
	[UPSELLING] [bit] NOT NULL,
	[COMPRA_UPSELLING] [bit] NOT NULL,
	[IMPORTE_UPSELLING] [money] NULL,
	[GRABADOR] [nvarchar](255) NULL,
	[MODIFICADOR] [nvarchar](255) NULL,
	[OFERTA_UPSELLING] [nvarchar](255) NULL,
	[APLAZADO] [bit] NOT NULL,
	[TRSP] [nvarchar](255) NULL,
	[RED10] [money] NULL,
	[IS_PRIVILEGIE] [bit] NOT NULL,
	[IMPCARTECLUB] [money] NULL,
	[REDCARTECLUB] [money] NULL,
	[IS_PESADO] [bit] NOT NULL,
	[IS_PESADO_PARCIAL] [bit] NOT NULL,
	[FOURNISSEUR] [bit] NOT NULL,
	[IS_SUSTITUTIVO] [bit] NOT NULL,
	[IS_SIN_ARTICULO] [bit] NOT NULL,
	[IMP_SINART] [money] NULL,
	[IS_BAV] [bit] NOT NULL,
	[IMP_BAV] [money] NULL,
	[PEDIDO_BAV] [nvarchar](255) NULL,
	[IMP_A_PAGAR] [money] NULL,
	[NextAvailableNumber] [nvarchar](255) NULL,
	[IS_BAV_GENERADO] [bit] NULL,
	[IMP_BAV_GENERADO] [money] NULL,
 CONSTRAINT [PK_Pedidos1] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[Pedidos] ADD  CONSTRAINT [DF_Pedidos_ENVIO]  DEFAULT ((0)) FOR [ENVIO]
GO

ALTER TABLE [dbo].[Pedidos] ADD  CONSTRAINT [DF_Pedidos_FRAIS]  DEFAULT ((0)) FOR [FRAIS]
GO

ALTER TABLE [dbo].[Pedidos] ADD  CONSTRAINT [DF_Pedidos_COBRADO]  DEFAULT ((0)) FOR [COBRADO]
GO

ALTER TABLE [dbo].[Pedidos] ADD  CONSTRAINT [DF__Pedidos__IMPAGAD__6B24EA83]  DEFAULT ((0)) FOR [IMPAGADO]
GO

ALTER TABLE [dbo].[Pedidos] ADD  CONSTRAINT [DF__Pedidos__RECOBRA__6C190EBC]  DEFAULT ((0)) FOR [RECOBRADO]
GO

ALTER TABLE [dbo].[Pedidos] ADD  CONSTRAINT [DF__Pedidos__INCOBRA__6D0D32F5]  DEFAULT ((0)) FOR [INCOBRABLE]
GO

ALTER TABLE [dbo].[Pedidos] ADD  CONSTRAINT [DF_Pedidos_CALLCENTER]  DEFAULT ((0)) FOR [CALLCENTER]
GO

ALTER TABLE [dbo].[Pedidos] ADD  CONSTRAINT [DF_Pedidos_RESERVASTOCK]  DEFAULT ((0)) FOR [RESERVASTOCK]
GO

ALTER TABLE [dbo].[Pedidos] ADD  CONSTRAINT [DF_Pedidos_UPSELLING]  DEFAULT ((0)) FOR [UPSELLING]
GO

ALTER TABLE [dbo].[Pedidos] ADD  CONSTRAINT [DF_Pedidos_COMPRA_UPSELLING]  DEFAULT ((0)) FOR [COMPRA_UPSELLING]
GO

ALTER TABLE [dbo].[Pedidos] ADD  CONSTRAINT [DF_Pedidos_APLAZADO]  DEFAULT ((0)) FOR [APLAZADO]
GO

ALTER TABLE [dbo].[Pedidos] ADD  CONSTRAINT [DF_Pedidos_RED10]  DEFAULT ((0)) FOR [RED10]
GO

ALTER TABLE [dbo].[Pedidos] ADD  CONSTRAINT [DF_Pedidos_IS_PRIVILEGIE]  DEFAULT ((0)) FOR [IS_PRIVILEGIE]
GO

ALTER TABLE [dbo].[Pedidos] ADD  CONSTRAINT [DF_Pedidos_IMPCARTECLUB]  DEFAULT ((0)) FOR [IMPCARTECLUB]
GO

ALTER TABLE [dbo].[Pedidos] ADD  CONSTRAINT [DF_Pedidos_REDCARTECLUB]  DEFAULT ((0)) FOR [REDCARTECLUB]
GO

ALTER TABLE [dbo].[Pedidos] ADD  CONSTRAINT [DF_Pedidos_IS_PESADO]  DEFAULT ((0)) FOR [IS_PESADO]
GO

ALTER TABLE [dbo].[Pedidos] ADD  CONSTRAINT [DF_Pedidos_IS_PESADO_PARCIAL]  DEFAULT ((0)) FOR [IS_PESADO_PARCIAL]
GO

ALTER TABLE [dbo].[Pedidos] ADD  CONSTRAINT [DF_Pedidos_FOURNISSEUR]  DEFAULT ((0)) FOR [FOURNISSEUR]
GO

ALTER TABLE [dbo].[Pedidos] ADD  CONSTRAINT [DF_Pedidos_IS_SUSTITUTIVO]  DEFAULT ((0)) FOR [IS_SUSTITUTIVO]
GO

ALTER TABLE [dbo].[Pedidos] ADD  CONSTRAINT [DF_Pedidos_IS_SIN_ARTICULO]  DEFAULT ((0)) FOR [IS_SIN_ARTICULO]
GO

ALTER TABLE [dbo].[Pedidos] ADD  CONSTRAINT [DF_Pedidos_IMP_SINART]  DEFAULT ((0)) FOR [IMP_SINART]
GO

ALTER TABLE [dbo].[Pedidos] ADD  CONSTRAINT [DF_Pedidos_IS_BAV]  DEFAULT ((0)) FOR [IS_BAV]
GO

ALTER TABLE [dbo].[Pedidos] ADD  CONSTRAINT [DF_Pedidos_IMP_BAV]  DEFAULT ((0)) FOR [IMP_BAV]
GO

ALTER TABLE [dbo].[Pedidos] ADD  CONSTRAINT [DF_Pedidos_IS_BAV_GENERADO]  DEFAULT ((0)) FOR [IS_BAV_GENERADO]
GO

ALTER TABLE [dbo].[Pedidos] ADD  CONSTRAINT [DF_Pedidos_IMP_BAV_GENERADO]  DEFAULT ((0)) FOR [IMP_BAV_GENERADO]
GO


