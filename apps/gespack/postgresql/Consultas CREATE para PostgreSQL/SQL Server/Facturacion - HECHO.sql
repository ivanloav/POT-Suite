USE [MaylisPromovent]
GO

/****** Object:  Table [dbo].[Facturacion]    Script Date: 02/11/2024 11:10:11 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Facturacion](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[FECHA] [datetime] NULL,
	[MARCA] [nvarchar](255) NULL,
	[FACTURA] [nvarchar](255) NOT NULL,
	[CLIENTE] [nvarchar](255) NULL,
	[NOMBRE] [nvarchar](255) NULL,
	[APELLIDO] [nvarchar](255) NULL,
	[REF_EXP] [nvarchar](255) NULL,
	[PRIORITAIRE] [money] NULL,
	[TRANSPORTE] [money] NULL,
	[TOTAL_TRANS] [money] NULL,
	[COLISSIMO] [money] NULL,
	[BI1] [money] NULL,
	[TVA1] [money] NULL,
	[BI2] [money] NULL,
	[TVA2] [money] NULL,
	[TOTAL] [money] NULL,
	[ESTADO] [nvarchar](255) NULL,
	[IMPAGADO] [bit] NOT NULL,
	[IMPORTE_IMPAGO] [nvarchar](255) NULL,
	[FECHA_IMPAGADO] [nvarchar](255) NULL,
	[RECOBRADO] [bit] NOT NULL,
	[IMPORTE_RECOBRADO] [nvarchar](255) NULL,
	[FECHA_RECOBRADO] [nvarchar](255) NULL,
	[INCOBRABLE] [bit] NOT NULL,
	[IMPORTE_INCOBRABLE] [nvarchar](255) NULL,
	[FECHA_INCOBRABLE] [nvarchar](255) NULL,
	[COMISION_PAGADA] [bit] NOT NULL,
	[FACTURA_MOCALL] [nvarchar](255) NULL,
	[COMISION] [nvarchar](255) NULL,
	[TRABAJADOR] [nvarchar](255) NULL,
	[FECHA_FACTURADO] [datetime] NULL,
 CONSTRAINT [PK_Facturacion_1] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[Facturacion] ADD  CONSTRAINT [DF_Facturacion_IMPAGADO]  DEFAULT ((0)) FOR [IMPAGADO]
GO

ALTER TABLE [dbo].[Facturacion] ADD  CONSTRAINT [DF_Facturacion_RECOBRADO]  DEFAULT ((0)) FOR [RECOBRADO]
GO

ALTER TABLE [dbo].[Facturacion] ADD  CONSTRAINT [DF_Facturacion_INCOBRABLE]  DEFAULT ((0)) FOR [INCOBRABLE]
GO

ALTER TABLE [dbo].[Facturacion] ADD  CONSTRAINT [DF_Facturacion_COMISION_PAGADA]  DEFAULT ((0)) FOR [COMISION_PAGADA]
GO


