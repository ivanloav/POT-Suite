USE [MaylisPromovent]
GO

/****** Object:  Table [dbo].[Facturacion_Abonos]    Script Date: 02/11/2024 11:10:27 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Facturacion_Abonos](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[FECHA_ABONO] [datetime] NULL,
	[FECHA_FACTURA] [datetime] NULL,
	[MARCA] [nvarchar](255) NULL,
	[FACTURA_ABONO] [nvarchar](255) NOT NULL,
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
	[TRABAJADOR] [nvarchar](255) NULL,
	[FACTURA] [nvarchar](255) NULL,
 CONSTRAINT [PK_Facturacion_Abonos_1] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO


